'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppMessage, sanitizePhoneNumber } from '@/lib/whatsapp/elevate'

interface CreateCampaignParams {
    name: string
    leads: { name: string; phone: string; notes?: string }[]
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    caption?: string
    batchDelay?: number
    batchSize?: number
}

export async function createCampaign({
    name,
    leads,
    mediaUrl,
    mediaType,
    caption,
    batchDelay = 5,
    batchSize = 10
}: CreateCampaignParams) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }

    const orgId = profile.organization_id

    try {
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
                name,
                organization_id: orgId,
                status: 'draft',
                total_leads: leads.length,
                sent_count: 0,
                media_url: mediaUrl,
                media_type: mediaType,
                caption: caption,
                batch_delay: batchDelay,
                batch_size: batchSize
            })
            .select()
            .single()

        if (campaignError) throw new Error(`Campaign Creation Failed: ${campaignError.message}`)

        // Process Leads
        const { error: rpcError } = await supabase.rpc('bulk_upload_leads', {
            p_org_id: orgId,
            p_campaign_id: campaign.id,
            p_leads: leads
        })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            throw new Error(`Bulk Upload Failed: ${rpcError.message}`)
        }

        revalidatePath('/crm/campaigns')
        return { success: true, campaignId: campaign.id }

    } catch (error: unknown) {
        console.error('Create Campaign Error:', error)
        return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// Launch a quick campaign to selected leads
export async function launchCampaign(selectedLeadIds: string[], message: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', sent: 0, failed: 0 }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization', sent: 0, failed: 0 }

    if (!selectedLeadIds.length) {
        return { error: 'No leads selected', sent: 0, failed: 0 }
    }

    if (!message.trim()) {
        return { error: 'Message cannot be empty', sent: 0, failed: 0 }
    }

    // 1. Fetch leads data
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, phone')
        .in('id', selectedLeadIds)
        .eq('organization_id', profile.organization_id)

    if (leadsError || !leads) {
        return { error: 'Failed to fetch leads', sent: 0, failed: 0 }
    }

    // 2. Create campaign record
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
            name: `Quick Campaign - ${new Date().toLocaleDateString()}`,
            organization_id: profile.organization_id,
            status: 'sending',
            total_leads: leads.length,
            sent_count: 0,
            caption: message,
        })
        .select()
        .single()

    if (campaignError) {
        console.error('Campaign creation error:', campaignError)
        return { error: 'Failed to create campaign', sent: 0, failed: 0 }
    }

    // 3. Send messages to each lead
    let sent = 0
    let failed = 0
    const logs: { leadId: string; phone: string; success: boolean; error?: string }[] = []

    for (const lead of leads) {
        if (!lead.phone) {
            failed++
            logs.push({ leadId: lead.id, phone: '', success: false, error: 'No phone number' })
            continue
        }

        // Personalize message with lead name
        const personalizedMessage = message.replace(/{name}/gi, lead.name || 'Customer')

        try {
            const result = await sendWhatsAppMessage(lead.phone, personalizedMessage)

            if (result.success) {
                sent++
                logs.push({ leadId: lead.id, phone: lead.phone, success: true })

                // Log successful message
                await supabase.from('message_logs').insert({
                    campaign_id: campaign.id,
                    lead_id: lead.id,
                    phone: sanitizePhoneNumber(lead.phone),
                    message: personalizedMessage,
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                })
            } else {
                failed++
                logs.push({ leadId: lead.id, phone: lead.phone, success: false, error: result.error })

                // Log failed message
                await supabase.from('message_logs').insert({
                    campaign_id: campaign.id,
                    lead_id: lead.id,
                    phone: sanitizePhoneNumber(lead.phone),
                    message: personalizedMessage,
                    status: 'failed',
                    error: result.error,
                })
            }
        } catch (error) {
            failed++
            logs.push({
                leadId: lead.id,
                phone: lead.phone,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 4. Update campaign status
    await supabase
        .from('campaigns')
        .update({
            status: failed === leads.length ? 'failed' : 'completed',
            sent_count: sent,
            completed_at: new Date().toISOString(),
        })
        .eq('id', campaign.id)

    revalidatePath('/crm/campaigns')

    return {
        success: true,
        campaignId: campaign.id,
        sent,
        failed,
        total: leads.length,
        logs
    }
}

export async function processCampaignBatch(campaignId: string) {
    const supabase = await createClient()

    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

    if (campaignError || !campaign) {
        console.error('Fetch Campaign Error:', campaignError)
        return { processed: 0, logs: ['Failed to fetch campaign settings'] }
    }

    const batchSize = campaign.batch_size || 5

    const { data: queueItems, error: fetchError } = await supabase
        .from('campaign_queue')
        .select(`
            id,
            lead_id,
            leads (
                id,
                name,
                phone
            )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')
        .limit(batchSize)

    if (fetchError) {
        console.error('Fetch Queue Error:', fetchError)
        return { processed: 0, logs: [] }
    }

    if (!queueItems || queueItems.length === 0) {
        return { processed: 0, logs: [] }
    }

    const logs: string[] = []
    const processedIds: string[] = []
    const failedIds: string[] = []

    await Promise.all(queueItems.map(async (item: any) => {
        const leadData = item.leads
        const lead = Array.isArray(leadData) ? leadData[0] : leadData

        if (!lead || !lead.phone) {
            failedIds.push(item.id)
            logs.push(`Failed: Lead ${item.lead_id} missing data`)
            return
        }

        try {
            // Use ElevateAPI wrapper
            const messageText = (campaign.caption || `Hello {name}, we have a special offer for you!`)
                .replace('{name}', lead.name)

            const result = await sendWhatsAppMessage(lead.phone, messageText)

            if (result.success) {
                processedIds.push(item.id)
                logs.push(`Sent to ${lead.phone} (${lead.name})`)
            } else {
                failedIds.push(item.id)
                logs.push(`Failed ${lead.phone}: ${result.error}`)
            }

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Send Error for ${lead.phone}:`, error)
            failedIds.push(item.id)
            logs.push(`Failed ${lead.phone}: ${msg}`)
        }
    }))

    if (processedIds.length > 0) {
        await supabase
            .from('campaign_queue')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .in('id', processedIds)
    }

    if (failedIds.length > 0) {
        await supabase
            .from('campaign_queue')
            .update({ status: 'failed' })
            .in('id', failedIds)
    }

    revalidatePath(`/crm/campaigns/${campaignId}`)

    return { processed: queueItems.length, logs }
}

// Get leads for campaign selector
export async function getLeadsForCampaign() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return []

    const { data: leads } = await supabase
        .from('leads')
        .select('id, name, phone, status, source')
        .eq('organization_id', profile.organization_id)
        .not('phone', 'is', null)
        .order('created_at', { ascending: false })

    return leads || []
}

// Get campaign history
export async function getCampaignHistory() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return []

    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20)

    return campaigns || []
}
