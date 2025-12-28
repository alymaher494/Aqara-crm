import { getCampaigns } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Megaphone, Clock, CheckCircle2, AlertCircle, BarChart3, Users } from "lucide-react"
import Link from "next/link"

export default async function CampaignsPage() {
    const { data: campaigns, error } = await getCampaigns()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <Megaphone className="h-4 w-4" />
                        Marketing Module
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        WhatsApp <span className="text-primary">Campaigns</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Analyze and monitor your mass communication efforts.
                    </p>
                </div>

                <Link href="/crm/campaigns/create">
                    <Button className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold h-12 px-6">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Launch New Campaign
                    </Button>
                </Link>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-center">
                    <p className="text-red-600 font-bold">{error}</p>
                </div>
            )}

            {/* Campaign Cards/Table */}
            <div className="grid gap-4">
                {campaigns?.map((campaign: any) => (
                    <div key={campaign.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-xl">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-slate-900">{campaign.name}</h3>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 rounded-lg">
                                        {campaign.status}
                                    </Badge>
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-2 italic">
                                    "{campaign.message_template}"
                                </p>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(campaign.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        {campaign.total_leads} Total Reached
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="text-center px-4 border-r border-slate-200">
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-black mb-1">Pending</div>
                                    <div className="flex items-center justify-center gap-1.5 text-blue-600 font-black text-xl">
                                        <Clock className="h-4 w-4" />
                                        {campaign.stats.pending}
                                    </div>
                                </div>
                                <div className="text-center px-4 border-r border-slate-200">
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-black mb-1">Sent</div>
                                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-black text-xl">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {campaign.stats.sent}
                                    </div>
                                </div>
                                <div className="text-center px-4">
                                    <div className="text-xs uppercase tracking-wider text-slate-400 font-black mb-1">Failed</div>
                                    <div className="flex items-center justify-center gap-1.5 text-red-600 font-black text-xl">
                                        <AlertCircle className="h-4 w-4" />
                                        {campaign.stats.failed}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {campaigns?.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
                        <Megaphone className="h-10 w-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No campaigns yet</h2>
                    <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">
                        Start your first marketing campaign to engage with your leads effectively.
                    </p>
                    <Link href="/crm/campaigns/create">
                        <Button className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Launch Your First Campaign
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
