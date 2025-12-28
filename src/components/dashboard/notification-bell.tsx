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
import { markNotificationsAsRead } from '@/app/(dashboard)/crm/leads/actions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        async function fetchNotifications() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data as Notification[])
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

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
                    setNotifications(prev => [newNotification, ...prev].slice(0, 10))
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleOpenChange = async (open: boolean) => {
        if (open && unreadCount > 0) {
            try {
                await markNotificationsAsRead()
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            } catch (error) {
                console.error('Failed to mark notifications as read:', error)
            }
        }
    }

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} asChild>
                                <Link
                                    href={notification.link_url || '#'}
                                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.is_read ? 'bg-slate-50' : ''
                                        }`}
                                >
                                    <div className="flex w-full justify-between items-center">
                                        <span className="font-semibold text-sm">{notification.title}</span>
                                        <span className="text-[10px] text-slate-500">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
