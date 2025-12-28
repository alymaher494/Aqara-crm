import { createClient } from '@/lib/supabase/server'
import { HeaderClient } from './header-client'

export async function Header() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <HeaderClient isSuperAdmin={false} />
    }

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
