'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Checks if the current user is a Super Admin based on profiles table
 */
export async function isSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    return !!profile?.is_super_admin
}

export async function getSystemStats() {
    if (!(await isSuperAdmin())) return { error: 'Unauthorized' }

    const supabase = await createClient()

    const [
        { count: totalOrgs },
        { count: totalUsers },
        { count: activeSubs },
        { count: totalCampaigns },
        { count: activeDevices }
    ] = await Promise.all([
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }).neq('subscription_plan', 'free'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('whatsapp_devices').select('*', { count: 'exact', head: true }).eq('status', 'connected')
    ])

    return {
        data: {
            totalOrganizations: totalOrgs || 0,
            activeSubscriptions: activeSubs || 0,
            totalUsers: totalUsers || 0,
            totalCampaigns: totalCampaigns || 0,
            activeWhatsAppDevices: activeDevices || 0
        }
    }
}

export async function getAllOrganizations() {
    if (!(await isSuperAdmin())) return { error: 'Unauthorized', data: [] }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: [] }

    return { data: data || [] }
}

export async function updateOrgStatus(orgId: string, status: string) {
    if (!(await isSuperAdmin())) return { error: 'Unauthorized' }

    const supabase = await createClient()

    // Assuming we might need to add a 'status' column, for now we can use subscription_plan or a new column
    // The user asked for a 'Suspended/Active' toggle. I'll use a 'status' column.
    const { error } = await supabase
        .from('organizations')
        .update({ status })
        .eq('id', orgId)

    if (error) {
        // If status column doesn't exist, we'll need to add it via migration
        console.error('Update Org Status Error:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}
