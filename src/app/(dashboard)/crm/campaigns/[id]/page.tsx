import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampaignMonitor } from "@/components/crm/campaign-monitor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CampaignPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function CampaignPage({ params }: CampaignPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in.</div>
    }

    // 2. Get user's organization_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return <div>Error loading profile.</div>
    }

    // 3. Fetch campaign details
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single()

    if (error || !campaign) {
        notFound()
    }

    // 4. Fetch Stats from Queue
    // We can use count() queries
    const { count: total } = await supabase
        .from('campaign_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)

    const { count: pending } = await supabase
        .from('campaign_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .eq('status', 'pending')

    const { count: sent } = await supabase
        .from('campaign_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .eq('status', 'sent')

    const { count: failed } = await supabase
        .from('campaign_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .eq('status', 'failed')

    const stats = {
        total: total || 0,
        pending: pending || 0,
        sent: sent || 0,
        failed: failed || 0
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/crm/campaigns">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                            {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Created on {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <CampaignMonitor campaign={campaign} stats={stats} />
        </div>
    )
}
