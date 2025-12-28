import { getSystemStats, getAllOrganizations } from "@/lib/admin-actions"
import { OrgTable } from "@/components/admin/org-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Users, CreditCard, Activity, Globe, Zap, Megaphone, Smartphone } from "lucide-react"

export default async function AdminPage() {
    const [
        { data: stats, error: statsError },
        { data: organizations, error: orgsError }
    ] = await Promise.all([
        getSystemStats(),
        getAllOrganizations()
    ])

    if (statsError || orgsError) {
        return <div className="p-8 text-red-500 font-bold bg-white/5 rounded-2xl border border-red-500/20">Error loading data: {statsError || orgsError}</div>
    }

    const statCards = [
        {
            title: "Total Organizations",
            value: stats?.totalOrganizations || 0,
            icon: Building2,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Active Subscriptions",
            value: stats?.activeSubscriptions || 0,
            icon: zapIcon, // Using my custom name or imported one
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Total Platform Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Total Campaigns",
            value: stats?.totalCampaigns || 0,
            icon: Megaphone,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "Active WA Devices",
            value: stats?.activeWhatsAppDevices || 0,
            icon: Smartphone,
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
    ]

    return (
        <div className="space-y-12">
            {/* Page Title & Context */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">SYSTEM OVERVIEW</h2>
                    <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-amber-500" />
                        Infrastructure Monitoring & Tenant Management
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-[#1e293b] border border-white/10 px-4 py-2 rounded-xl">
                    <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300">SYSTEM STABLE</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-none bg-[#1e293b] shadow-2xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-[100px] -mr-8 -mt-8 opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {stat.value}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">REAL-TIME DATA</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Organizations Management */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1 bg-amber-500 rounded-full" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Active Tenants</h3>
                </div>
                <OrgTable organizations={organizations || []} />
            </div>
        </div>
    )
}

const zapIcon = Zap // Helper for naming
