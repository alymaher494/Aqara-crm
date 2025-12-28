'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema validating the form inputs
const preferencesSchema = z.object({
    minBudget: z.coerce.number().optional(),
    maxBudget: z.coerce.number().optional(),
    location: z.string().optional(),
    type: z.string().optional(),
    minBeds: z.coerce.number().optional(),
})

export async function savePreferences(leadId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Extract and Validate Data
    const rawData = {
        minBudget: formData.get('minBudget'),
        maxBudget: formData.get('maxBudget'),
        location: formData.get('location'),
        type: formData.get('type'),
        minBeds: formData.get('minBeds'),
    }

    const validated = preferencesSchema.safeParse(rawData)

    if (!validated.success) {
        return { message: 'Invalid data format' }
    }

    const { minBudget, maxBudget, location, type, minBeds } = validated.data

    // 2. Map to Database Columns (The Critical Part)
    // DB Column Name : Value
    const updates = {
        min_budget: minBudget || 0,
        max_budget: maxBudget || 0,
        location: location || '',
        property_type: type || '', // Mapped correctly to 'property_type'
        min_beds: minBeds || 0,
    }

    // 3. Send to Supabase
    const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)

    if (error) {
        console.error('Save Preferences Error:', error)
        return { message: `Database Error: ${error.message}` }
    }

    // 4. Refresh UI
    revalidatePath(`/crm/leads/${leadId}`)
    return { message: 'success' }
}

export async function getMatchingInventory(leadId: string) {
    const supabase = await createClient()

    // 1. Fetch Lead
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

    if (leadError || !lead) return { error: 'Lead not found' }

    // 2. Fetch Projects Joined with Developers
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*, developer:developers(name, logo_url)')

    if (projectsError) return { error: projectsError.message }

    // 3. Match Engine Logic
    // Criteria: project.price_range_min <= lead.budget
    const leadBudget = lead.budget || lead.max_budget || 0
    const leadLocation = lead.interested_in?.toLowerCase() || ''

    const matchedProjects = (projects || [])
        .filter(project => (project.price_range_min || 0) <= leadBudget)
        .map(project => {
            // Determine Match Level
            let matchLevel: '100% Match' | 'Potential Match' = 'Potential Match'
            if (leadBudget >= (project.price_range_max || project.price_range_min || 0)) {
                matchLevel = '100% Match'
            }

            // Calculate Relevance Score (Closeness to budget)
            // Higher is more relevant. Difference = 0 is best.
            const relevanceScore = Math.abs((project.price_range_min || 0) - leadBudget)

            return {
                ...project,
                matchLevel,
                relevanceScore,
                type: 'project'
            }
        })
        // Sort by Relevance (closest price first)
        .sort((a, b) => a.relevanceScore - b.relevanceScore)

    return {
        projects: matchedProjects,
        error: null
    }
}

