import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, MessageCircle, ArrowLeft, Calendar, User, Info, Mail, Globe, Target, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { LeadInsights } from "@/components/crm/lead-insights"
import { ActivityTimeline } from "@/components/crm/activity-timeline"
import { KeyInfoCard } from "@/components/crm/key-info-card"
import { AddTaskDialog } from "@/components/crm/add-task-dialog"
import { StatusSelector } from "@/components/crm/status-selector"
import { MatchingProperties } from "@/components/crm/matching-properties"
import { LeadTasksWidget } from "@/components/crm/lead-tasks-widget"
import { ContactButtons } from "@/components/crm/contact-buttons"
import { AssignAgentSelector } from "@/components/crm/assign-agent-selector"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LeadPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function LeadPage({ params }: LeadPageProps) {
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

    // 3. Fetch lead details (ensure it belongs to the org)
    const { data: lead, error } = await supabase
        .from('leads')
        .select('*, client_comment, sales_comment, summary, interested_in')
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single()

    if (error || !lead) {
        notFound()
    }

    // 4. Fetch assigned agent name if exists
    let assignedAgentName = null
    if (lead.assigned_to) {
        const { data: agent } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', lead.assigned_to)
            .single()
        assignedAgentName = agent?.full_name || null
    }

    // 5. Fetch tasks for this lead
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('lead_id', lead.id)
        .order('due_date', { ascending: true })

    const activeTasks = tasks?.filter(t => !t.is_completed) || []
    const nextAction = activeTasks[0] // Earliest incomplete task (sorted by due_date above)

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* 1. Header Section */}
            <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/crm/leads">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{lead.phone}</span>
                                </div>
                                <Separator orientation="vertical" className="h-3 mx-1" />
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border-slate-200">
                                    ID: {lead.id.split('-')[0]}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusSelector id={lead.id} currentStatus={lead.status} />
                        <ContactButtons leadId={lead.id} phone={lead.phone} />
                    </div>
                </div>
            </header>

            <main className="px-6 py-8">

                <div className="grid gap-8 md:grid-cols-12 max-w-7xl mx-auto">
                    {/* 2. Main Content (Left Column) */}
                    <div className="md:col-span-8 space-y-8">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-white border p-1 h-12 shadow-sm rounded-xl">
                                <TabsTrigger value="overview" className="px-6 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-medium transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="insights" className="px-6 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-medium transition-all">Insights</TabsTrigger>
                                <TabsTrigger value="timeline" className="px-6 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-medium transition-all">Timeline</TabsTrigger>
                                <TabsTrigger value="preferences" className="px-6 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-medium transition-all">Property Matches</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab Content */}
                            <TabsContent value="overview" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50/50 border-b px-8 py-6">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <Info className="h-4 w-4 text-primary" />
                                            Lead Profile & Key Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-8 text-left">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                                                <Badge className="capitalize font-bold bg-primary/10 text-primary border-none shadow-none">{lead.status}</Badge>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source</p>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-800">{lead.source || 'Direct'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Created</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-800">{format(new Date(lead.created_at), "MMM d, yyyy")}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</p>
                                                <div className="flex items-center gap-2 truncate" title={lead.email}>
                                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-800">{lead.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-8 flex items-center gap-3">
                                            <Separator className="flex-1" />
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">Requirements</span>
                                            <Separator className="flex-1" />
                                        </div>

                                        {/* Key Info Content (Summary & Project) */}
                                        <div className="px-8 py-8 text-left">
                                            <KeyInfoCard lead={lead} noCardWrapper />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="insights" className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                                <LeadInsights
                                    leadId={lead.id}
                                    initialClientComment={lead.client_comment || ''}
                                    initialSalesComment={lead.sales_comment || ''}
                                />
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                                <ActivityTimeline leadId={lead.id} />
                            </TabsContent>

                            <TabsContent value="preferences" className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                                <MatchingProperties lead={lead} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 3. Sidebar (Right Column) */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {/* Next Action Card */}
                            <Card className="border-none shadow-md ring-1 ring-primary/20 bg-primary/[0.03] overflow-hidden">
                                <div className="h-1.5 bg-primary w-full" />
                                <CardHeader className="pb-4 pt-6">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                                        <Clock className="h-4 w-4" />
                                        Next Action
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {nextAction ? (
                                        <div className="p-4 rounded-xl bg-white border border-primary/10 shadow-sm ring-1 ring-primary/5 text-left">
                                            <p className="font-bold text-slate-900 text-base leading-tight">{nextAction.title}</p>
                                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-bold uppercase">
                                                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                                {nextAction.due_date ? format(new Date(nextAction.due_date), "MMM d, p") : 'Date not set'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 text-center">
                                            <p className="text-sm text-muted-foreground italic font-medium">Nothing scheduled yet</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                        <div className="group transition-all duration-300 transform active:scale-95">
                                            <AddTaskDialog leads={[{ id: lead.id, name: lead.name }]} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/80 text-center font-bold uppercase tracking-tighter">
                                            Driven by your task calendar
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Agent Card */}
                            <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white">
                                <CardHeader className="pb-3 border-b bg-slate-50/50 text-left">
                                    <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                        <Shield className="h-3.5 w-3.5 text-slate-400" />
                                        Account Manager
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4 mb-6 text-left">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                {assignedAgentName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{assignedAgentName || 'Unassigned'}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Lead Owner</p>
                                        </div>
                                    </div>
                                    <AssignAgentSelector
                                        leadId={lead.id}
                                        currentAssignedTo={lead.assigned_to}
                                    />
                                </CardContent>
                            </Card>

                            {/* Tasks Widget */}
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden ring-1 ring-slate-200">
                                <LeadTasksWidget tasks={activeTasks} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
