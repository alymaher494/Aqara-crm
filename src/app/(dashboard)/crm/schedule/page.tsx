import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/crm/calendar-view"
import { AddTaskDialog } from "@/components/crm/add-task-dialog"
import { getTasks } from "@/app/(dashboard)/crm/tasks/actions"
import { Calendar as CalendarIcon, ListTodo } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SchedulePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Please log in</div>

    const { data: tasks, error } = await getTasks()

    // Fetch Leads for the Add Dialog
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    const { data: leads } = await supabase
        .from('leads')
        .select('id, name')
        .eq('organization_id', profile?.organization_id || '')
        .not('status', 'eq', 'lost')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Glassmorphism */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/50 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 rotate-3">
                        <CalendarIcon className="h-8 w-8 text-white -rotate-3" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">My Schedule</h2>
                        <p className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Daily Agenda & Meeting Optimizer
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/crm/tasks">
                        <Button variant="outline" className="rounded-xl border-white bg-white/50 hover:bg-white hover:shadow-xl transition-all font-bold text-xs uppercase tracking-widest px-6 h-12">
                            <ListTodo className="h-4 w-4 mr-2 text-slate-400" />
                            List View
                        </Button>
                    </Link>
                    <AddTaskDialog leads={leads || []} />
                </div>
            </div>

            {/* Calendar View */}
            <div className="relative">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <CalendarView tasks={tasks || []} />
            </div>
        </div>
    )
}
