'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/actions'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        const { data, error } = await getNotifications()
        if (error) {
            toast.error('Failed to load notifications')
        } else {
            setNotifications(data || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAllAsRead = async () => {
        const res = await markAllNotificationsAsRead()
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('All notifications marked as read')
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        }
    }

    const handleMarkAsRead = async (id: string) => {
        const res = await markNotificationAsRead(id)
        if (!res.error) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
            case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <Bell className="h-8 w-8 text-blue-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full italic ml-2">
                                {unreadCount} New
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-500 font-bold text-sm">Stay updated with your latest alerts and events.</p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        className="rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50 rounded-3xl">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Bell className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">All caught up!</h3>
                            <p className="text-slate-400 font-bold text-sm">You have no notifications at the moment.</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={cn(
                                "group border-none transition-all duration-300 hover:shadow-xl hover:translate-x-1 rounded-2xl overflow-hidden",
                                !notification.is_read ? "bg-blue-50/40 ring-1 ring-inset ring-blue-100" : "bg-white"
                            )}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                            <CardContent className="p-4 flex items-start gap-4 cursor-pointer">
                                <div className={cn(
                                    "mt-1 p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                                    !notification.is_read ? "bg-white shadow-sm" : "bg-slate-50"
                                )}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={cn(
                                            "font-black tracking-tight truncate",
                                            !notification.is_read ? "text-blue-900" : "text-slate-700"
                                        )}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm leading-relaxed",
                                        !notification.is_read ? "text-blue-800/70 font-medium" : "text-slate-500"
                                    )}>
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse mt-2" />
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
