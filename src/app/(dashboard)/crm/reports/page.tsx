'use client'

import { useState, useEffect } from 'react'
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Users,
    Target,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MonthlyGrowthChart, LeadSourceChart } from '@/components/dashboard/dashboard-charts'
import { ExportButton } from '@/components/crm/reports/export-button'
import { getAgentPerformance, getLeadsBySource, getKPIs } from '@/lib/reports-actions'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ReportsPage() {
    const [range, setRange] = useState('30days')
    const [performance, setPerformance] = useState<any[]>([])
    const [sources, setSources] = useState<any[]>([])
    const [kpis, setKpis] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        let start: string | undefined
        let end = format(new Date(), 'yyyy-MM-dd')

        switch (range) {
            case '7days':
                start = format(subDays(new Date(), 7), 'yyyy-MM-dd')
                break
            case '30days':
                start = format(subDays(new Date(), 30), 'yyyy-MM-dd')
                break
            case 'thisMonth':
                start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
                end = format(endOfMonth(new Date()), 'yyyy-MM-dd')
                break
            case '3months':
                start = format(subMonths(new Date(), 3), 'yyyy-MM-dd')
                break
        }

        const [perfRes, srcRes, kpiRes] = await Promise.all([
            getAgentPerformance(start, end),
            getLeadsBySource(start, end),
            getKPIs(start, end)
        ])

        setPerformance(perfRes.data || [])
        setSources(srcRes.data || [])
        setKpis(kpiRes.data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [range])

    if (isLoading && !kpis) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <BarChart3 className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/50 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 rotate-3">
                        <BarChart3 className="h-8 w-8 text-white -rotate-3" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Analytics Hub</h2>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">Intelligence & Performance Metrics</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
                        <Calendar className="h-4 w-4 text-slate-400 ml-2" />
                        <Select value={range} onValueChange={setRange}>
                            <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none focus:ring-0 font-bold text-xs uppercase tracking-wider">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="3months">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <ExportButton type="leads" />
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-24 w-24 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            Total Revenue
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-900 tabular-nums">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpis?.totalRevenue || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-3 w-3" />
                            +12.5% vs prev period
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="h-24 w-24 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            Conversion Rate
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-900 tabular-nums">
                            {kpis?.conversionRate.toFixed(1)}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                            {kpis?.wonLeads} won of {kpis?.totalLeads} total
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-24 w-24 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            Avg Deal Size
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-900 tabular-nums">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpis?.avgDealSize || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-bold text-slate-500">
                            Based on {kpis?.wonLeads} deals
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="h-24 w-24 text-slate-900" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            New Leads
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-900 tabular-nums">
                            {kpis?.totalLeads}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 w-fit px-2 py-1 rounded-lg">
                            <ArrowDownRight className="h-3 w-3" />
                            -3.2% vs prev period
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <div className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base font-black uppercase tracking-tight italic">Leads by Source</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <LeadSourceChart data={sources} />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base font-black uppercase tracking-tight italic">Sales Growth Trend</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {/* Reusing MonthlyGrowthChart as a placeholder for sales trend */}
                        <MonthlyGrowthChart data={[
                            { name: 'Week 1', value: 400 },
                            { name: 'Week 2', value: 700 },
                            { name: 'Week 3', value: 900 },
                            { name: 'Week 4', value: 1200 },
                        ]} />
                    </CardContent>
                </Card>
            </div>

            {/* Agent Leaderboard */}
            <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                            <CardTitle className="text-base font-black uppercase tracking-tight italic">Agent Performance Leaderboard</CardTitle>
                            <CardDescription className="text-xs font-bold">Ranking based on won deals in selected period</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-400">Agent Name</TableHead>
                                <TableHead className="text-center font-black text-xs uppercase tracking-widest text-slate-400">Leads Handled</TableHead>
                                <TableHead className="text-center font-black text-xs uppercase tracking-widest text-slate-400">Calls Attempted</TableHead>
                                <TableHead className="text-center font-black text-xs uppercase tracking-widest text-slate-400">Deals Won</TableHead>
                                <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-400">Efficiency</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {performance.sort((a, b) => b.won - a.won).map((agent, idx) => {
                                const efficiency = agent.leads > 0 ? ((agent.won / agent.leads) * 100).toFixed(1) : '0'
                                return (
                                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-bold text-slate-900">{agent.agentName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-slate-600 tabular-nums">{agent.leads}</TableCell>
                                        <TableCell className="text-center font-bold text-slate-600 tabular-nums">{agent.calls}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black tabular-nums">
                                                {agent.won}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-slate-900 tabular-nums">{efficiency}%</span>
                                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${Math.min(parseInt(efficiency), 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
