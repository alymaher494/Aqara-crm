'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    due_date: z.string().min(1, 'Due date is required'),
    type: z.enum(['meeting', 'call', 'deadline', 'viewing']).default('call'),
    lead_id: z.string().optional(),
})

export async function createTask(prevState: { message?: string, errors?: any } | null, formData: FormData) {
    const supabase = await createClient()

    const validatedFields = taskSchema.safeParse({
        title: formData.get('title'),
        due_date: formData.get('due_date'),
        type: formData.get('type') || 'call',
        lead_id: formData.get('lead_id') || undefined,
    })

    if (!validatedFields.success) {
        return {
            message: 'Invalid fields',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { title, due_date, type, lead_id } = validatedFields.data

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { message: 'Organization not found' }

    const { error } = await supabase.from('tasks').insert({
        title,
        due_date,
        type,
        lead_id: lead_id && lead_id !== 'none' ? lead_id : null,
        organization_id: profile.organization_id,
        is_completed: false,
        created_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Create Task Error:', error)
        return { message: 'Database Error' }
    }

    revalidatePath('/crm/tasks')
    if (lead_id) revalidatePath(`/crm/leads/${lead_id}`)
    return { message: 'success' }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)

    if (error) {
        console.error('Toggle Task Error:', error)
        throw new Error('Failed to update task')
    }

    revalidatePath('/crm/tasks')
    // We might need to find the lead_id to revalidate lead page, but generic revalidation is hard here without fetching first.
    // For now, client side update will handle immediate UI feedback.
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        console.error('Delete Task Error:', error)
        throw new Error('Failed to delete task')
    }

    revalidatePath('/crm/tasks')
}

export async function getTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { data: [] }

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, lead:leads(id, name)')
        .eq('organization_id', profile.organization_id)
        .order('due_date', { ascending: true })

    if (error) return { error: error.message, data: [] }
    return { data: tasks || [] }
}
