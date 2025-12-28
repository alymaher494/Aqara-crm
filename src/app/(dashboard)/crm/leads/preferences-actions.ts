'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeadPreferences(leadId: string, preferences: {
    minBudget?: number
    maxBudget?: number
    location?: string
    type?: string
    minBeds?: number
}) {
    const supabase = await createClient()

    // Ensure numeric values are valid numbers or null/undefined
    const min_budget = preferences.minBudget ? Number(preferences.minBudget) : null
    const max_budget = preferences.maxBudget ? Number(preferences.maxBudget) : null
    const min_beds = preferences.minBeds ? Number(preferences.minBeds) : null

    const { error } = await supabase
        .from('leads')
        .update({
            min_budget: min_budget,
            max_budget: max_budget,
            location: preferences.location,
            property_type: preferences.type,
            min_beds: min_beds
        })
        .eq('id', leadId)

    if (error) {
        console.error('Update Preferences Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/crm/leads/${leadId}`)
    return { success: true }
}
