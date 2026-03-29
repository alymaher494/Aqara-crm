import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyGrowthChart } from "@/components/dashboard/dashboard-charts"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { TrendingUp, BarChart3, Activity } from "lucide-react"
import { format, startOfDay, subMonths } from "date-fns"

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Auth & Org Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-8">Please log in.</div>
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return <div className="p-8">No Organization Found</div>
    }

    const orgId = profile.organization_id
    const today = startOfDay(new Date()).toISOString()

    // 2. Data Fetching
    const [
        { count: callsToday },
        { count: whatsappToday },
        { count: newLeadsToday },
        { count: tasksDoneToday },
        { data: activities },
        { data: leadsByDate }
    ] = await Promise.all([
        supabase.from('activity_logs').select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('type', 'call_attempt')
            .gte('created_at', today),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('type', 'whatsapp_opened')
            .gte('created_at', today),
        supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', today),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_completed', true)
            .gte('updated_at', today), // Assuming updated_at reflects completion date
        supabase.from('activity_logs')
            .select(`
                id, type, description, created_at,
                profiles (full_name),
                leads (name)
            `)
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10),
        supabase.from('leads').select('created_at')
            .eq('organization_id', orgId)
            .gte('created_at', subMonths(new Date(), 6).toISOString())
    ])

    // 3. Process Growth Data
    const monthMap = new Map<string, number>()
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const key = format(date, 'MMM')
        monthMap.set(key, 0)
    }

    leadsByDate?.forEach((l: { created_at: string }) => {
        const key = format(new Date(l.created_at), 'MMM')
        if (monthMap.has(key)) {
            monthMap.set(key, (monthMap.get(key) || 0) + 1)
        }
    })
    const growthData = Array.from(monthMap.entries()).map(([name, value]) => ({ name, value }))

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">Command Center</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Welcome back, <span className="text-slate-900 font-semibold">{profile.full_name || user.email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-border/60 shadow-lg ring-1 ring-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live System Feed</span>
                </div>
            </div>

            {/* today's Performance KPIs */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Performance</h2>
                </div>
                <StatsCards
                    callsCount={callsToday || 0}
                    whatsappCount={whatsappToday || 0}
                    newLeadsCount={newLeadsToday || 0}
                    tasksDoneCount={tasksDoneToday || 0}
                />
            </div>

            {/* Command Center Layout */}
            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Side: Stats & Charts */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-lg ring-1 ring-slate-200 bg-white/90 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b bg-gradient-to-r from-slate-50/80 to-transparent">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-bold">Growth Intelligence</CardTitle>
                                    <CardDescription className="text-xs">Lead acquisition velocity over the last 6 months</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <MonthlyGrowthChart data={growthData} />
                        </CardContent>
                    </Card>

                    <div className="grid gap-8 md:grid-cols-1">
                        {/* Placeholder for future detailed widgets or secondary charts */}
                    </div>
                </div>

                {/* Right Side: Activity Pulse */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    <ActivityFeed initialLogs={activities as any || []} />
                </div>
            </div>
        </div>
    )
}
