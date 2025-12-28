'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name: string, phone_number: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            phone_number: data.phone_number,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Profile Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/profile')
    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            organizations:organization_id(name)
        `)
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Get Profile Error:', error)
        return { error: error.message }
    }

    return { data }
}
