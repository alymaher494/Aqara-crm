'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Checks if the current user is a Super Admin.
 */
export async function isSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: admin } = await supabase
        .from('app_admins')
        .select('id')
        .eq('user_id', user.id)
        .single()

    return !!admin
}

export async function getTenants() {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) return { error: 'Unauthorized' }

    const supabase = await createClient()

    // Fetch orgs + crude count of users
    // Note: Supabase doesn't allow Count on joins easily without casting. 
    // We'll fetch orgs first.
    const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }

    // For user counts, we might need a separate query or assume profiles have org_id
    // We'll do a simple loop or separate query if needed. 
    // For now, let's return orgs.
    return { data: orgs }
}

export async function createTenant(data: { name: string, plan: string, max_users: number }) {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) return { error: 'Unauthorized' }

    const supabase = await createClient()

    const { data: org, error } = await supabase
        .from('organizations')
        .insert({
            name: data.name,
            subscription_plan: data.plan,
            max_users: data.max_users
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, org }
}

export async function updateTenantLimits(id: string, data: { plan: string, max_users: number, expiry_date?: string }) {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) return { error: 'Unauthorized' }

    const supabase = await createClient()

    const { error } = await supabase
        .from('organizations')
        .update({
            subscription_plan: data.plan,
            max_users: data.max_users,
            expiry_date: data.expiry_date || null
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function deleteTenant(id: string) {
    const isAdmin = await isSuperAdmin()
    if (!isAdmin) return { error: 'Unauthorized' }

    const supabase = await createClient()

    // This will cascade delete profiles, leads, etc if FKs are set up correctly
    const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}
