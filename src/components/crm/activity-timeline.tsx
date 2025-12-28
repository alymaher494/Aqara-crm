'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"
import { ActivityLog } from "@/types"
import { formatDistanceToNow } from "date-fns"
import {
    Phone,
    MessageCircle,
    FileText,
    UserPlus,
    RefreshCcw,
    Circle
} from "lucide-react"

interface ActivityTimelineProps {
    leadId: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    call_attempt: { icon: Phone, color: "text-blue-600 bg-blue-50", label: "Call Attempt" },
    whatsapp_opened: { icon: MessageCircle, color: "text-green-600 bg-green-50", label: "WhatsApp" },
    note_added: { icon: FileText, color: "text-slate-600 bg-slate-50", label: "Note Added" },
    status_changed: { icon: RefreshCcw, color: "text-purple-600 bg-purple-50", label: "Status Update" },
    assignment_changed: { icon: UserPlus, color: "text-indigo-600 bg-indigo-50", label: "Assignment" },
    default: { icon: Circle, color: "text-slate-400 bg-slate-50", label: "Activity" }
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchLogs() {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false })

            if (data) {
                setLogs(data as ActivityLog[])
            }
            setIsLoading(false)
        }

        fetchLogs()

        // Subscribe to changes
        const channel = supabase
            .channel(`lead-activities-${leadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_logs',
                    filter: `lead_id=eq.${leadId}`
                },
                (payload) => {
                    const newLog = payload.new as ActivityLog
                    setLogs((prev) => [newLog, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [leadId, supabase])

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 py-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/4" />
                            <div className="h-3 bg-slate-100 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                <p className="text-sm italic">No activities logged yet.</p>
            </div>
        )
    }

    return (
        <div className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {logs.map((log) => {
                const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.default
                const Icon = config.icon

                return (
                    <div key={log.id} className="relative pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${config.color} z-10`}>
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-slate-900">{config.label}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : 'Just now'}
                                </span>
                            </div>
                            {log.description && (
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {log.description}
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
