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
            { key: 'pipeline', icon: Kanban, href: '/crm/pipeline' },
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
    }

    const isActive = (href: string) => {
        if (href === '/crm') return pathname === '/crm'
        return pathname.startsWith(href)
    }

    return (
        <div className="flex flex-col h-full bg-white border-e border-slate-200">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <Link href="/crm" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A+</span>
                    </div>
                    <span className="font-bold text-xl text-slate-900">Aqara Plus</span>
                </Link>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {/* Section Label */}
                        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-start">
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
                                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                            active
                                                ? 'bg-slate-100 text-slate-900 border-s-2 border-s-blue-500'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        )}
                                    >
                                        <item.icon className={cn(
                                            'h-5 w-5',
                                            active ? 'text-blue-500' : 'text-slate-400'
                                        )} />
                                        {label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer Section */}
            <div className="px-3 py-4 border-t border-slate-200 space-y-1">
                {/* Settings */}
                <Link
                    href="/crm/settings"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        pathname === '/crm/settings'
                            ? 'bg-slate-100 text-slate-900 border-s-2 border-s-blue-500'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                >
                    <Settings className="h-5 w-5 text-slate-400" />
                    Settings
                </Link>

                {/* Super Admin (conditional) */}
                {isSuperAdmin && (
                    <Link
                        href="/admin"
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                            pathname.startsWith('/admin')
                                ? 'bg-amber-50 text-amber-700 border-s-2 border-s-amber-500'
                                : 'text-amber-600 hover:bg-amber-50'
                        )}
                    >
                        <ShieldCheck className="h-5 w-5 text-amber-500" />
                        Super Admin
                    </Link>
                )}

                {/* Logout */}
                <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl"
                >
                    <LogOut className={cn("h-5 w-5", lang === 'ar' && "rotate-180")} />
                    Logout
                </Button>
            </div>
        </div>
    )
}
