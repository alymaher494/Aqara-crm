'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Project, Developer } from '@/types'

/**
 * Helper to verify if the current user is an Admin
 */
async function isAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

export async function createProject(data: Partial<Project>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }
    if (profile.role !== 'admin') return { error: 'Unauthorized: Only admins can create projects.' }

    const { error } = await supabase
        .from('projects')
        .insert({
            ...data,
            organization_id: profile.organization_id,
            created_at: new Date().toISOString(),
        })

    if (error) {
        console.error('Create Project Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/inventory')
    return { success: true }
}

export async function deleteLead(leadId: string) {
    if (!(await isAdmin())) {
        return { error: 'Unauthorized: Only admins can delete leads.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

    if (error) {
        console.error('Delete Lead Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/leads')
    return { success: true }
}

export async function deleteProject(projectId: string) {
    if (!(await isAdmin())) {
        return { error: 'Unauthorized: Only admins can delete projects.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

    if (error) {
        console.error('Delete Project Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/inventory')
    return { success: true }
}

export async function deleteDeveloper(developerId: string) {
    if (!(await isAdmin())) {
        return { error: 'Unauthorized: Only admins can delete developers.' }
    }

    const supabase = await createClient()

    // 1. Check if developer has linked projects
    const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', developerId)

    if (countError) return { error: countError.message }
    if (count && count > 0) {
        return { error: `Cannot delete developer with ${count} active project(s).` }
    }

    const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', developerId)

    if (error) {
        console.error('Delete Developer Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/inventory')
    revalidatePath('/crm/developers')
    return { success: true }
}

export async function getDevelopersWithCount(searchQuery?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found', data: [] }

    let query = supabase
        .from('developers')
        .select(`
            *,
            projects:projects(count)
        `)
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true })

    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) return { error: error.message, data: [] }

    // Transform count from array to number
    const transformed = data.map((d: any) => ({
        ...d,
        projects_count: d.projects[0]?.count || 0
    }))

    return { data: transformed }
}

export async function upsertDeveloper(data: Partial<Developer>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }
    if (profile.role !== 'admin') return { error: 'Only admins can manage developers' }

    const payload = {
        ...data,
        organization_id: profile.organization_id,
        updated_at: new Date().toISOString()
    }

    // Remove relations or computed fields before upsert
    const { projects_count, projects, ...cleanPayload } = payload as any

    const { error } = await supabase
        .from('developers')
        .upsert(cleanPayload)

    if (error) return { error: error.message }

    revalidatePath('/crm/developers')
    revalidatePath('/crm/inventory')
    return { success: true }
}

/** 
 * Campaign Actions
 */

export async function createCampaign(data: { name: string, message: string, filters: any }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }
    if (profile.role !== 'admin') return { error: 'Only admins can create campaigns' }

    // 1. Fetch leads based on filters
    let query = supabase
        .from('leads')
        .select('id')
        .eq('organization_id', profile.organization_id)

    if (data.filters.status && data.filters.status !== 'all') {
        query = query.eq('status', data.filters.status)
    }

    const { data: leads, error: leadsError } = await query
    if (leadsError) return { error: leadsError.message }
    if (!leads || leads.length === 0) return { error: 'No leads match the filters' }

    // 2. Create Campaign
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
            name: data.name,
            message_template: data.message,
            target_filters: data.filters,
            total_leads: leads.length,
            organization_id: profile.organization_id,
            status: 'scheduled'
        })
        .select()
        .single()

    if (campaignError) return { error: campaignError.message }

    // 3. Queue Messages
    const queueEntries = leads.map(lead => ({
        campaign_id: campaign.id,
        lead_id: lead.id,
        organization_id: profile.organization_id,
        status: 'pending'
    }))

    const { error: queueError } = await supabase
        .from('campaign_queue')
        .insert(queueEntries)

    if (queueError) {
        console.error('Queue Error:', queueError)
        return { error: 'Campaign created but failed to queue messages' }
    }

    revalidatePath('/crm/campaigns')
    return { success: true, campaignId: campaign.id }
}

export async function getCampaigns() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role, team_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found', data: [] }

    // Enhanced fetch based on Role
    let query = supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', profile.organization_id)

    if (profile.role === 'agent') {
        // Agents only see their own campaigns
        query = query.eq('created_by', user.id)
    } else if (profile.role === 'team_leader' && profile.team_id) {
        // Team Leaders see campaigns from their team members
        // We'll need a way to filter by team_id of the creator
        // For simplicity in this logic, we use a subquery or join-like filter
        // In a real RLS setup, the policy handles this, but for the UI fetch:
        const { data: teamMembers } = await supabase
            .from('profiles')
            .select('id')
            .eq('team_id', profile.team_id)

        const memberIds = teamMembers?.map(m => m.id) || [user.id]
        query = query.in('created_by', memberIds)
    }

    const { data: campaigns, error: cError } = await query
        .order('created_at', { ascending: false })

    if (cError) return { error: cError.message, data: [] }

    // Fetch stats for each campaign
    const enriched = await Promise.all(campaigns.map(async (c) => {
        const { count: pending } = await supabase.from('campaign_queue').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'pending')
        const { count: sent } = await supabase.from('campaign_queue').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'sent')
        const { count: failed } = await supabase.from('campaign_queue').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'failed')

        return {
            ...c,
            stats: {
                pending: pending || 0,
                sent: sent || 0,
                failed: failed || 0
            }
        }
    }))

    return { data: enriched }
}

export async function getLeadsCount(filters: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role, team_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return 0

    let query = supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }

    // Role-based filtering for counts
    if (profile.role === 'agent') {
        query = query.eq('assigned_agent_id', user.id)
    } else if (profile.role === 'team_leader' && profile.team_id) {
        const { data: teamMembers } = await supabase
            .from('profiles')
            .select('id')
            .eq('team_id', profile.team_id)
        const memberIds = teamMembers?.map(m => m.id) || [user.id]
        query = query.in('assigned_agent_id', memberIds)
    }

    const { count, error } = await query
    if (error) return 0
    return count || 0
}

/**
 * Notifications Actions
 */

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Notifications Error:', error)
        return { error: error.message, data: [] }
    }

    return { data: data || [] }
}

export async function getUnreadNotificationCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Get Unread Count Error:', error)
        return 0
    }

    return count || 0
}

export async function markNotificationAsRead(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Mark As Read Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/notifications')
    return { success: true }
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Mark All As Read Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/notifications')
    return { success: true }
}
