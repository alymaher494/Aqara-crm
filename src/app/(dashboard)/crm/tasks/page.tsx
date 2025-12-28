import { createClient } from "@/lib/supabase/server"
import { AddTaskDialog } from "@/components/crm/add-task-dialog"
import { TaskItem } from "@/components/crm/task-item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TasksPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Please log in</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return <div>No organization found</div>

    // Fetch Tasks with Lead details
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*, lead:leads(id, name)')
        .eq('organization_id', profile.organization_id)
        .order('due_date', { ascending: true })

    // Fetch Leads for the Add Dialog
    const { data: leads } = await supabase
        .from('leads')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .not('status', 'eq', 'lost')
        .order('created_at', { ascending: false })

    const pendingTasks = tasks?.filter(t => !t.is_completed) || []
    const completedTasks = tasks?.filter(t => t.is_completed) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                <AddTaskDialog leads={leads || []} />
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="space-y-4 mt-4">
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No pending tasks. Good job!</div>
                    ) : (
                        pendingTasks.map(task => <TaskItem key={task.id} task={task} />)
                    )}
                </TabsContent>
                <TabsContent value="completed" className="space-y-4 mt-4">
                    {completedTasks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No completed tasks yet.</div>
                    ) : (
                        completedTasks.map(task => <TaskItem key={task.id} task={task} />)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
