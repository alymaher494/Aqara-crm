'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, MessageCircle, Info, RefreshCcw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface ActivityLog {
    id: string
    type: 'call_attempt' | 'whatsapp_opened' | 'status_change' | 'note_added' | string
    description: string
    created_at: string
    profiles?: {
        full_name: string | null
    } | null
    leads?: {
        name: string | null
    } | null
}

const getIcon = (type: string) => {
    switch (type) {
        case 'call_attempt':
            return <Phone className="h-3.5 w-3.5 text-blue-500" />
        case 'whatsapp_opened':
            return <MessageCircle className="h-3.5 w-3.5 text-green-500" />
        default:
            return <Info className="h-3.5 w-3.5 text-slate-400" />
    }
}

export function ActivityFeed({ initialLogs }: { initialLogs: ActivityLog[] }) {
    const [logs, setLogs] = useState<ActivityLog[]>(initialLogs)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchLatestLogs = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                id, type, description, created_at,
                profiles (full_name),
                leads (name)
            `)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data && !error) {
            const formattedLogs = data.map(log => ({
                ...log,
                profiles: Array.isArray(log.profiles) ? log.profiles[0] : log.profiles,
                leads: Array.isArray(log.leads) ? log.leads[0] : log.leads
            })) as ActivityLog[]
            setLogs(formattedLogs)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLatestLogs()

        const channel = supabase
            .channel('dashboard-activity')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activity_logs' },
                async (payload) => {
                    const { data, error } = await supabase
                        .from('activity_logs')
                        .select(`
                            id, type, description, created_at,
                            profiles (full_name),
                            leads (name)
                        `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data && !error) {
                        const newLog = {
                            ...data,
                            profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
                            leads: Array.isArray(data.leads) ? data.leads[0] : data.leads
                        } as ActivityLog
                        setLogs(prev => [newLog, ...prev].slice(0, 10))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <Card className="border-none shadow-lg ring-1 ring-slate-200 overflow-hidden h-full bg-white/90 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50/80 to-transparent border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                        <RefreshCcw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                        Live Activity Feed
                    </CardTitle>
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 text-[10px] uppercase font-bold px-2 py-0 shadow-sm">
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100/80">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm italic">
                            No recent activity
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-300 flex items-start gap-4 group">
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm italic text-[10px] group-hover:scale-110 transition-transform duration-300">
                                    <AvatarImage src={`https://avatar.vercel.sh/${log.profiles?.full_name || 'agent'}`} />
                                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold uppercase">
                                        {(log.profiles?.full_name || 'A')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-sm text-slate-900 leading-snug">
                                        <span className="font-bold">{log.profiles?.full_name || 'Agent'}</span>
                                        {' '}
                                        <span className="text-slate-600">{log.description.replace(/^(.*?) for (.*?)$/, '$1')}</span>
                                        {log.leads?.name && (
                                            <>
                                                {' '}
                                                <span className="font-bold text-primary">@{log.leads.name}</span>
                                            </>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:shadow-md transition-shadow duration-300">
                                            {getIcon(log.type)}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
