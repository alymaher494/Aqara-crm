'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Project, Developer } from '@/types'

export async function createProject(data: Partial<Project>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }

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

export async function getDevelopers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found', data: [] }

    const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true })

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data: data || [] }
}

export async function getProjects() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found', data: [] }

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            developer:developers(*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data: data || [] }
}

export async function getProperties() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found', data: [] }

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data: data || [] }
}
