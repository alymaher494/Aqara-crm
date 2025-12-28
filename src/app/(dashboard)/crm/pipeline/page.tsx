import { createClient } from "@/lib/supabase/server"
import { KanbanBoard } from "@/components/crm/kanban-board"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function PipelinePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Please log in</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return <div>No organization found</div>

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Sales Pipeline</h2>
                <Link href="/crm/leads">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </Link>
            </div>

            <KanbanBoard initialLeads={leads || []} />
        </div>
    )
}
