import { createClient } from "@/lib/supabase/server"
import SettingsPageClient from "@/components/crm/settings-page-client"

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div>Please log in.</div>
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return <div>Error loading profile.</div>
    }

    const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

    const { data: team } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)

    return <SettingsPageClient organization={organization} team={team || []} />
}
