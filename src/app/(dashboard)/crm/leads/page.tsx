import { createClient } from "@/lib/supabase/server"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Lead } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { LeadForm } from "@/components/crm/lead-form"
import { LeadsImportDialog } from "@/components/crm/leads-import-dialog"

export default async function LeadsPage() {
    const supabase = await createClient()

    // 1. Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view leads.</div>
    }

    // 2. Get user's organization_id from profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.organization_id) {
        console.error('Error fetching profile or no organization:', profileError)
        return <div>Error loading user profile. Please contact support.</div>
    }

    // 3. Fetch leads for this organization with their tasks and assigned agents
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
            *,
            tasks(id, due_date, is_completed, title),
            assigned_profile:profiles!leads_assigned_to_fkey(id, full_name)
        `)

        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    if (leadsError) {
        console.error('Error fetching leads:', leadsError)
        return <div>Error loading leads.</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex items-center gap-2">
                    <LeadsImportDialog />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Lead
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Create Lead</SheetTitle>
                                <SheetDescription>
                                    Add a new lead to your organization.
                                </SheetDescription>
                            </SheetHeader>
                            <LeadForm />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            {(!leads || leads.length === 0) ? (
                <div className="mt-8">
                    <EmptyState
                        icon={Users}
                        title="No leads found"
                        description="You haven't added any leads yet. Start by creating a new lead."
                        action={
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Create Lead</SheetTitle>
                                        <SheetDescription>
                                            Add a new lead to your organization.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <LeadForm />
                                </SheetContent>
                            </Sheet>
                        }
                    />
                </div>
            ) : (
                <DataTable columns={columns} data={(leads as Lead[]) || []} />
            )}
        </div>
    )
}
