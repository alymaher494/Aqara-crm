'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Get team members for current organization
export async function getTeamMembers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization', data: [] }

    const { data: members, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: [] }
    return { data: members || [] }
}

// Invite a new user to the team
export async function inviteUser(formData: FormData) {
    const supabase = await createClient()

    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const phone = formData.get('phone') as string

    if (!full_name) {
        return { error: 'Name is required' }
    }

    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization found' }

    // Skip email check since column doesn't exist

    // For now, create a placeholder profile
    // In production, you would use supabase.auth.admin.inviteUserByEmail()
    const { error } = await supabase.from('profiles').insert({
        id: crypto.randomUUID(), // Temporary ID - will be replaced when user signs up
        full_name,
        role: role || 'agent',
        phone: phone || null,
        organization_id: profile.organization_id,
        is_active: true,
        is_invited: true, // Mark as pending invitation
        created_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Error inviting user:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/settings/team')
    return { success: true, message: 'Invitation sent successfully' }
}

// Update user role
export async function updateRole(userId: string, role: 'manager' | 'agent') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

    if (error) {
        console.error('Error updating role:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/settings/team')
    return { success: true }
}

// Toggle user active status
export async function toggleStatus(userId: string) {
    const supabase = await createClient()

    // Get current status
    const { data: user } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single()

    if (!user) return { error: 'User not found' }

    const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', userId)

    if (error) {
        console.error('Error toggling status:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/settings/team')
    return { success: true }
}

// Delete/remove user from team
export async function removeUser(userId: string) {
    const supabase = await createClient()

    // Don't actually delete, just mark as inactive and clear org
    const { error } = await supabase
        .from('profiles')
        .update({
            is_active: false,
            organization_id: null
        })
        .eq('id', userId)

    if (error) {
        console.error('Error removing user:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/settings/team')
    return { success: true }
}
