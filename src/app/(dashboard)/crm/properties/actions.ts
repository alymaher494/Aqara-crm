'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Property } from '@/types'

export async function createProperty(data: Partial<Property>) {
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
        .from('properties')
        .insert({
            ...data,
            organization_id: profile.organization_id,
            status: data.status || 'available',
            created_at: new Date().toISOString(),
        })

    if (error) {
        console.error('Create Property Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/properties')
    return { success: true }
}

export async function updateProperty(id: string, data: Partial<Property>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('properties')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) {
        console.error('Update Property Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/crm/properties/${id}`)
    revalidatePath('/crm/properties')
    return { success: true }
}

export async function updatePropertyStatus(id: string, status: 'available' | 'sold' | 'reserved') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Update Status Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/crm/properties/${id}`)
    revalidatePath('/crm/properties')
    return { success: true }
}

export async function deleteProperty(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete Property Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/properties')
    return { success: true }
}

export async function getPropertyById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return { error: error.message }
    }

    return { data }
}

// Search properties (for matching with leads)
export async function searchProperties(query: {
    minPrice?: number
    maxPrice?: number
    type?: string
    location?: string
    minArea?: number
    maxArea?: number
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No organization', data: [] }

    let queryBuilder = supabase
        .from('properties')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'available')

    if (query.minPrice) {
        queryBuilder = queryBuilder.gte('price', query.minPrice)
    }
    if (query.maxPrice) {
        queryBuilder = queryBuilder.lte('price', query.maxPrice)
    }
    if (query.type) {
        queryBuilder = queryBuilder.eq('type', query.type)
    }
    if (query.location) {
        queryBuilder = queryBuilder.ilike('location', `%${query.location}%`)
    }
    if (query.minArea) {
        queryBuilder = queryBuilder.gte('area', query.minArea)
    }
    if (query.maxArea) {
        queryBuilder = queryBuilder.lte('area', query.maxArea)
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false })

    if (error) {
        return { error: error.message, data: [] }
    }

    return { data: data || [] }
}
