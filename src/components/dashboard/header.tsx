import { createClient } from '@/lib/supabase/server'
import { HeaderClient } from './header-client'

export async function Header() {
    const supabase = await createClient()

    // 1. Get current user// داخل ملف Header (Server Component)
    const { data: { user } } = await supabase.auth.getUser()
    let isSuperAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single()

        isSuperAdmin = profile?.is_super_admin || false
    }

    // عند استدعاء المكون:
    <UserNav isSuperAdmin={isSuperAdmin} />
    // 2. Fetch profile to check is_super_admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, full_name, email')
        .eq('id', user.id)
        .single()

    return (
        <HeaderClient
            isSuperAdmin={!!profile?.is_super_admin}
            userProfile={{
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                email: profile?.email || user.email || ''
            }}
        />
    )
}
