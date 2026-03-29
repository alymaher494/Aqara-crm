'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import {
    LayoutDashboard,
    Users,
    Kanban,
    Building2,
    Megaphone,
    CheckSquare,
    Clock,
    Settings,
    ShieldCheck,
    LogOut,
    Smartphone,
    Calendar,
    BarChart3,
} from 'lucide-react'
import { signOut } from '@/app/(dashboard)/actions'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    isSuperAdmin?: boolean
}

// Navigation structure with sections
const navSections = [
    {
        label: 'MAIN',
        items: [
            { key: 'dashboard', icon: LayoutDashboard, href: '/crm' },
        ],
    },
    {
        label: 'CRM',
        items: [
            { key: 'leads', icon: Users, href: '/crm/leads' },
            { key: 'schedule', icon: Calendar, href: '/crm/schedule' },
            { key: 'pipeline', icon: Kanban, href: '/crm/pipeline' },
            { key: 'reports', icon: BarChart3, href: '/crm/reports' },
            { key: 'inventory', icon: Building2, href: '/crm/inventory' },
            { key: 'developers', icon: Building2, href: '/crm/developers' },
            { key: 'campaigns', icon: Megaphone, href: '/crm/campaigns' },
        ],
    },
    {
        label: 'INTEGRATIONS',
        items: [
            { key: 'whatsapp', icon: Smartphone, href: '/crm/integrations/whatsapp' },
        ],
    },
    {
        label: 'TEAM',
        items: [
            { key: 'team', icon: Users, href: '/crm/settings/team' },
            { key: 'tasks', icon: CheckSquare, href: '/crm/tasks' },
        ],
    },
]

export function Sidebar({ isSuperAdmin = false }: SidebarProps) {
    const pathname = usePathname()
    const { t, mounted, lang } = useTranslation()

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="flex flex-col h-full bg-white border-e border-slate-200">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <div className="animate-pulse bg-slate-200 h-6 w-28 rounded" />
                </div>
            </div>
        )
    }

    // Translation map with fallbacks fromDictionaries
    const labels: Record<string, string> = {
        dashboard: t.sidebar.dashboard,
        leads: t.sidebar.leads,
        pipeline: t.sidebar.pipeline,
        inventory: t.sidebar.inventory,
        campaigns: t.sidebar.campaigns,
        tasks: t.sidebar.tasks,
        attendance: t.sidebar.attendance,
        settings: t.sidebar.settings,
        admin: t.sidebar.admin,
        logout: t.common.logout,
        whatsapp: 'WhatsApp Integrations',
        schedule: 'Schedule',
        reports: 'Analytics Hub',
    }

    const isActive = (href: string) => {
        if (href === '/crm') return pathname === '/crm'
        return pathname.startsWith(href)
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-xl border-e border-border/60 shadow-2xl">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
                <Link href="/crm" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        <span className="text-white font-bold text-sm">A+</span>
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Aqara Plus</span>
                </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {/* Section Label */}
                        <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-start">
                            {section.label}
                        </p>
                        {/* Section Items */}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActive(item.href)
                                const label = item.key.charAt(0).toUpperCase() + item.key.slice(1)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out group relative overflow-hidden',
                                            active
                                                ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-s-2 border-primary shadow-md'
                                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:shadow-sm'
                                        )}
                                    >
                                        {active && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50" />
                                        )}
                                        <item.icon className={cn(
                                            'h-5 w-5 transition-all duration-300 relative z-10',
                                            active ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-slate-600'
                                        )} />
                                        <span className="relative z-10">{label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer Section */}
            <div className="px-3 py-4 border-t border-border/60 bg-gradient-to-r from-slate-50/50 to-transparent space-y-1">
                {/* Settings */}
                <Link
                    href="/crm/settings"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out group relative overflow-hidden',
                        pathname === '/crm/settings'
                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-s-2 border-primary shadow-md'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:shadow-sm'
                    )}
                >
                    {pathname === '/crm/settings' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50" />
                    )}
                    <Settings className={cn("h-5 w-5 transition-all duration-300 relative z-10", pathname === '/crm/settings' ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-slate-600')} />
                    <span className="relative z-10">Settings</span>
                </Link>

                {/* Super Admin (conditional) */}
                {isSuperAdmin && (
                    <Link
                        href="/admin"
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out group relative overflow-hidden',
                            pathname.startsWith('/admin')
                                ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-s-2 border-amber-500 shadow-md'
                                : 'text-amber-600 hover:bg-amber-50/80 hover:shadow-sm'
                        )}
                    >
                        {pathname.startsWith('/admin') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-50" />
                        )}
                        <ShieldCheck className={cn("h-5 w-5 transition-all duration-300 relative z-10", pathname.startsWith('/admin') ? 'text-amber-500 scale-110' : 'group-hover:text-amber-600')} />
                        <span className="relative z-10">Super Admin</span>
                    </Link>
                )}

                {/* Logout */}
                <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium text-slate-600 hover:bg-red-50/80 hover:text-red-600 hover:shadow-sm rounded-xl transition-all duration-300 ease-out group"
                >
                    <LogOut className={cn("h-5 w-5 transition-all duration-300 group-hover:scale-110", lang === 'ar' && "rotate-180")} />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    )
}
