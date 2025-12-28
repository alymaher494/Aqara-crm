'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCompanySettings(formData: {
    name: string
    work_start_time: string
    work_end_time: string
    work_days: string[]
}) {
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
        .from('organizations')
        .update({
            name: formData.name,
            work_start_time: formData.work_start_time,
            work_end_time: formData.work_end_time,
            work_days: formData.work_days
        })
        .eq('id', profile.organization_id)

    if (error) {
        console.error('Update Company Error:', error)
        return { error: error.message }
    }

    revalidatePath('/crm/settings')
    return { success: true }
}

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

// ...

export async function addNewTeamMember(data: { email: string, fullName: string, role: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile?.organization_id) return { error: 'No Organization' }

    // 1. Get Limits
    const { data: org } = await supabase.from('organizations').select('max_users, subscription_plan').eq('id', profile.organization_id).single()

    // 2. Count current users
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', profile.organization_id)

    // 3. Check Limit
    if ((count || 0) >= (org?.max_users || 5)) {
        return {
            error: `Plan limit reached. Your ${org?.subscription_plan} plan allows ${org?.max_users} users. Please upgrade to add more team members.`
        }
    }

    // 4. Create Admin Client
    const supabaseAdmin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 5. Create User
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: data.fullName }
    })

    if (createError) {
        return { error: createError.message }
    }

    if (!newUser.user) return { error: 'Failed to create user' }

    // 6. Create Profile Entry
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: newUser.user.id,
            email: data.email, // Ensure email is in profile if schema requires it
            full_name: data.fullName,
            organization_id: profile.organization_id,
            role: data.role || 'agent'
        })

    if (profileError) {
        console.error("Profile creation failed:", profileError)
        return { error: `User created but profile sync failed: ${profileError.message}` }
    }

    revalidatePath('/crm/settings')
    return { success: true, message: `Member added! Temporary Password: ${tempPassword}` }
}
