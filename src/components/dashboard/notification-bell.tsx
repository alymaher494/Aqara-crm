'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { markAllNotificationsAsRead } from '@/lib/actions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        if (data) {
            setNotifications(data as Notification[])
            // Fetch exact unread count from server for the badge
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false)

            setUnreadCount(count || 0)
        }
    }

    useEffect(() => {
        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev].slice(0, 5))
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleOpenChange = async (open: boolean) => {
        // We don't mark as read automatically on open anymore to avoid confusion, 
        // user can click "View All" or we can add a "Clear All" in dropdown.
    }

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group hover:bg-slate-100 rounded-xl transition-all h-10 w-10">
                    <Bell className="h-5 w-5 text-slate-600 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-red-600 text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 animate-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0 rounded-2xl shadow-2xl border-white/20 bg-white/90 backdrop-blur-xl overflow-hidden" align="end">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <DropdownMenuLabel className="p-0 font-black text-xs uppercase tracking-widest text-slate-400">
                        Recent Alerts
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {unreadCount} New
                        </span>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <Bell className="h-8 w-8 text-slate-200" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">No notifications yet</p>
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} asChild className="focus:bg-blue-50/50 outline-none">
                                <Link
                                    href={notification.link_url || '/crm/notifications'}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 cursor-pointer transition-colors border-b border-slate-50 last:border-0",
                                        !notification.is_read ? 'bg-blue-50/30' : ''
                                    )}
                                >
                                    <div className="flex w-full justify-between items-start gap-2">
                                        <span className={cn(
                                            "font-black text-xs tracking-tight leading-tight",
                                            !notification.is_read ? "text-blue-900" : "text-slate-700"
                                        )}>
                                            {notification.title}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap pt-0.5">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[11px] leading-relaxed line-clamp-2",
                                        !notification.is_read ? "text-blue-800/70 font-medium" : "text-slate-500"
                                    )}>
                                        {notification.message}
                                    </p>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                <DropdownMenuSeparator className="m-0 bg-slate-100" />
                <Link href="/crm/notifications" className="block p-3 text-center text-[10px] font-black text-blue-600 hover:bg-blue-50 uppercase tracking-[0.2em] transition-colors">
                    View All Notifications
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
