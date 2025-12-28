'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Lead } from '@/types'

const leadSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    notes: z.string().optional(),
})

export type CreateLeadState = {
    errors?: {
        name?: string[]
        phone?: string[]
        notes?: string[]
        _form?: string[]
    }
    message?: string
} | null

export async function createLead(prevState: CreateLeadState, formData: FormData): Promise<CreateLeadState> {
    const validatedFields = leadSchema.safeParse({
        name: formData.get('name'),
        phone: formData.get('phone'),
        notes: formData.get('notes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Lead.',
        }
    }

    const { name, phone, notes } = validatedFields.data

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'User not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.organization_id) {
        return { message: 'Organization not found' }
    }

    // Get optional assigned_to
    const assigned_to = formData.get('assigned_to') as string | null

    try {
        const { error } = await supabase.from('leads').insert({
            name,
            phone,
            notes,
            assigned_to: assigned_to || null,
            organization_id: profile.organization_id,
            status: 'new',
            created_at: new Date().toISOString(),
        })

        if (error) {
            if (error.code === '23505') {
                return {
                    message: 'This phone number is already registered.',
                    errors: { phone: ['This phone number is already registered.'] }
                }
            }
            console.error('Database Error:', error)
            return { message: 'Database Error: Failed to Create Lead.' }
        }
    } catch (error) {
        console.error('Server Error:', error)
        return { message: 'Server Error: Failed to Create Lead.' }
    }

    revalidatePath('/crm/leads')
    return { message: 'success' }
}

export async function updateLeadStatus(id: string, newStatus: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        console.error('Error updating lead status:', error)
        throw new Error('Failed to update lead status')
    }

    revalidatePath(`/crm/leads/${id}`)
    revalidatePath('/crm/leads')
    revalidatePath('/crm/pipeline')
}

export async function addNote(id: string, note: string) {
    const supabase = await createClient()

    const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('notes')
        .eq('id', id)
        .single()

    if (fetchError) {
        throw new Error('Failed to fetch lead')
    }

    const currentNotes = lead.notes || ''
    const timestamp = new Date().toLocaleString()
    const newNotes = `${currentNotes}\n\n[${timestamp}]: ${note}`

    const { error } = await supabase
        .from('leads')
        .update({ notes: newNotes })
        .eq('id', id)

    if (error) {
        throw new Error('Failed to add note')
    }

    revalidatePath(`/crm/leads/${id}`)
}

// Assign a lead to a team member
export async function assignLead(leadId: string, agentId: string | null) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('leads')
        .update({ assigned_to: agentId })
        .eq('id', leadId)

    if (error) {
        console.error('Error assigning lead:', error)
        throw new Error('Failed to assign lead')
    }

    revalidatePath(`/crm/leads/${leadId}`)
    revalidatePath('/crm/leads')

    // Add notification for the agent
    if (agentId) {
        const { data: lead } = await supabase
            .from('leads')
            .select('name')
            .eq('id', leadId)
            .single()

        await supabase.from('notifications').insert({
            user_id: agentId,
            title: 'Lead Assigned',
            message: `You have been assigned a new lead: ${lead?.name || 'Unknown'}`,
            type: 'info',
            link_url: `/crm/leads/${leadId}`,
            created_at: new Date().toISOString(),
        })
    }
}

export async function markNotificationsAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking notifications as read:', error)
        throw new Error('Failed to mark notifications as read')
    }

    revalidatePath('/')
}


// Get team members for assignment dropdown
export async function getTeamMembers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return []

    const { data: members } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile.organization_id)

    return members || []
}

export async function logActivity(leadId: string, type: string, description?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return

    const { error } = await supabase.from('activity_logs').insert({
        lead_id: leadId,
        organization_id: profile.organization_id,
        user_id: user.id,
        type,
        description,
        created_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Error logging activity:', error)
        throw new Error('Failed to log activity')
    }

    revalidatePath(`/crm/leads/${leadId}`)
}

export async function updateLeadComments(leadId: string, updates: { client_comment?: string; sales_comment?: string }) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead comments:', error)
        throw new Error('Failed to update lead comments')
    }

    revalidatePath('/crm/leads')
    revalidatePath(`/crm/leads/${leadId}`)
}


export async function updateLead(leadId: string, updates: Partial<Lead>) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead:', error)
        throw new Error('Failed to update lead')
    }

    revalidatePath('/crm/leads')
    revalidatePath(`/crm/leads/${leadId}`)
}


// Smart Merge: Bulk import leads from Excel/CSV
// Captures ALL unknown columns as notes

// Known columns that map directly to lead fields
const KNOWN_COLUMNS = ['name', 'phone', 'project', 'client comment', 'sales note', 'next action']

const STATUS_MAP: Record<string, string> = {
    'call back': 'contacted',
    'إعادة اتصال': 'contacted',
    'new': 'new',
    'جديد': 'new',
    'meeting': 'meeting',
    'اجتماع': 'meeting',
    'qualified': 'qualified',
    'مؤهل': 'qualified',
}

export async function importLeadsFromExcel(rows: Record<string, any>[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', imported: 0 }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization', imported: 0 }

    let imported = 0
    const errors: string[] = []

    for (const row of rows) {
        // Normalize keys to lowercase and trim
        const normalizedRow: Record<string, any> = {}
        for (const key of Object.keys(row)) {
            normalizedRow[key.toLowerCase().trim()] = row[key]
        }

        // Header Mapping
        const name = normalizedRow['name'] || normalizedRow['الاسم'] || normalizedRow['client name']
        const phone = normalizedRow['phone'] || normalizedRow['الهاتف'] || normalizedRow['رقم الهاتف'] || normalizedRow['mobile']
        const project = normalizedRow['project'] || normalizedRow['المشروع'] || normalizedRow['interested in']
        const clientComment = normalizedRow['client comment'] || normalizedRow['تعليق العميل']
        const salesNote = normalizedRow['sales note'] || normalizedRow['ملاحظات المبيعات'] || normalizedRow['sales comment']
        const nextAction = normalizedRow['next action'] || normalizedRow['الإجراء القادم']


        if (!name || !phone) {
            errors.push(`Skipped row: missing name or phone`)
            continue
        }

        const phoneStr = String(phone).trim()

        // 1. Check for duplicate phone
        const { data: existingLead } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', phoneStr)
            .eq('organization_id', profile.organization_id)
            .single()

        if (existingLead) {
            errors.push(`Duplicate phone skipped: ${phoneStr}`)
            continue
        }

        // 2. Prepare Lead Data
        const status = nextAction ? (STATUS_MAP[nextAction.toLowerCase().trim()] || 'new') : 'new'

        const { data: newLead, error: insertError } = await supabase.from('leads').insert({
            name: String(name).trim(),
            phone: phoneStr,
            interested_in: project ? String(project).trim() : null,
            client_comment: clientComment ? String(clientComment).trim() : null,
            sales_comment: salesNote ? String(salesNote).trim() : null,
            status: status,
            organization_id: profile.organization_id,
            created_at: new Date().toISOString(),
        }).select().single()

        if (insertError) {
            errors.push(`Error for ${name}: ${insertError.message}`)
            continue
        }

        // 3. Auto-Log Activities
        if (newLead) {
            // Client Comment Activity
            if (clientComment) {
                await supabase.from('activity_logs').insert({
                    lead_id: newLead.id,
                    organization_id: profile.organization_id,
                    user_id: user.id,
                    type: 'note_added',
                    description: `Client Comment: ${String(clientComment).trim()}`,
                    created_at: new Date().toISOString(),
                })
            }

            // Sales Note Activity (Marked as internal logic implied by type/description)
            if (salesNote) {
                await supabase.from('activity_logs').insert({
                    lead_id: newLead.id,
                    organization_id: profile.organization_id,
                    user_id: user.id,
                    type: 'note_added',
                    description: `Sales Note (Internal): ${String(salesNote).trim()}`,
                    created_at: new Date().toISOString(),
                })
            }
        }

        imported++
    }

    revalidatePath('/crm/leads')
    return { imported, errors, total: rows.length }
}

export async function bulkImportLeads(rows: Record<string, any>[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', imported: 0 }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization', imported: 0 }

    let imported = 0
    const errors: string[] = []

    for (const row of rows) {
        // Normalize keys to lowercase
        const normalizedRow: Record<string, any> = {}
        for (const key of Object.keys(row)) {
            normalizedRow[key.toLowerCase().trim()] = row[key]
        }

        const name = normalizedRow['name'] || normalizedRow['الاسم'] || normalizedRow['client name']
        const phone = normalizedRow['phone'] || normalizedRow['الهاتف'] || normalizedRow['mobile'] || normalizedRow['رقم الهاتف']

        if (!name || !phone) {
            errors.push(`Skipped row: missing name or phone`)
            continue
        }

        // Smart Merge: Capture ALL unknown columns as notes
        const unknownData: string[] = []
        for (const [key, value] of Object.entries(normalizedRow)) {
            if (!KNOWN_COLUMNS.includes(key) && value && String(value).trim()) {
                unknownData.push(`${key}: ${String(value).trim()}`)
            }
        }
        const combinedNotes = unknownData.join('\n')

        const { error } = await supabase.from('leads').insert({
            name: String(name).trim(),
            phone: String(phone).toString().trim(),
            email: normalizedRow['email']?.trim() || null,
            source: normalizedRow['source']?.trim() || 'import',
            notes: combinedNotes || null,
            status: normalizedRow['status']?.toLowerCase() || 'new',
            organization_id: profile.organization_id,
            created_at: new Date().toISOString(),
        })

        if (error) {
            if (error.code === '23505') {
                errors.push(`Duplicate phone: ${phone}`)
            } else {
                errors.push(`Error for ${name}: ${error.message}`)
            }
        } else {
            imported++
        }
    }

    revalidatePath('/crm/leads')
    return { imported, errors, total: rows.length }
}

