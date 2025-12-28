'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Square, Terminal, Activity, Clock, Zap } from 'lucide-react'
import { processCampaignBatch } from '@/app/(dashboard)/crm/campaigns/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Campaign } from '@/types'

interface CampaignMonitorProps {
    campaign: Campaign
    stats: {
        total: number
        pending: number
        sent: number
        failed: number
    }
}

export function CampaignMonitor({ campaign, stats: initialStats }: CampaignMonitorProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [stats, setStats] = useState(initialStats)
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    useEffect(() => {
        let shouldContinue = isRunning

        const runBatch = async () => {
            if (!shouldContinue) return

            try {
                // We don't pass batch size anymore, server reads it from DB
                const result = await processCampaignBatch(campaign.id)

                if (result.logs && result.logs.length > 0) {
                    setLogs(prev => [...prev, ...result.logs].slice(-50)) // Keep last 50 logs
                }

                if (result.processed > 0) {
                    // Optimistic update or refresh
                    router.refresh()
                    // Dynamic Delay
                    const delayMs = (campaign.batch_delay || 5) * 1000
                    setTimeout(() => {
                        if (shouldContinue) runBatch()
                    }, delayMs)
                } else {
                    setIsRunning(false)
                    toast.success('Campaign Completed!')
                }
            } catch (error) {
                console.error('Batch Error:', error)
                setIsRunning(false)
                toast.error('Campaign stopped due to error')
            }
        }

        if (isRunning) {
            runBatch()
        }

        return () => {
            shouldContinue = false
        }
    }, [isRunning, campaign.id, campaign.batch_delay, router])

    const progress = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="flex items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Campaign Control</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Delay: {campaign.batch_delay}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span>Batch: {campaign.batch_size}</span>
                        </div>
                        <div>
                            Status: {isRunning ? 'Running' : 'Idle'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isRunning ? (
                        <Button onClick={() => setIsRunning(true)} className="bg-green-600 hover:bg-green-700">
                            <Play className="mr-2 h-4 w-4" /> Start Campaign
                        </Button>
                    ) : (
                        <Button onClick={() => setIsRunning(false)} variant="destructive">
                            <Pause className="mr-2 h-4 w-4" /> Pause
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
            </div>

            {/* Terminal / Logs */}
            <Card className="bg-black text-green-400 font-mono text-sm h-[300px] flex flex-col">
                <CardHeader className="border-b border-gray-800 py-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        <span>Live Logs</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 space-y-1" ref={scrollRef}>
                    {logs.length === 0 && (
                        <div className="text-gray-500 italic">Waiting for logs...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="break-all">
                            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {log}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
