'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Bell, Sun, ChevronRight, Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { UserNav } from '@/components/dashboard/user-nav'
import { useTranslation } from '@/hooks/use-translation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/dashboard/sidebar'
import { NotificationBell } from '@/components/dashboard/notification-bell'

interface HeaderClientProps {
    isSuperAdmin?: boolean
    userProfile?: {
        name: string
        email: string
    }
}

export function HeaderClient({ isSuperAdmin = false, userProfile }: HeaderClientProps) {
    const pathname = usePathname()
    const { t, mounted, lang } = useTranslation()

    // Map routes to translated labels
    const routeLabels: Record<string, string> = {
        '/crm': t.sidebar.dashboard,
        '/crm/leads': t.sidebar.leads,
        '/crm/pipeline': t.sidebar.pipeline,
        '/crm/inventory': t.sidebar.inventory,
        '/crm/campaigns': t.sidebar.campaigns,
        '/crm/tasks': t.sidebar.tasks,
        '/crm/attendance': t.sidebar.attendance,
        '/crm/settings': t.sidebar.settings,
        '/admin': t.sidebar.admin,
    }

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs: { label: string; href: string }[] = []

        let currentPath = ''
        segments.forEach((segment) => {
            currentPath += `/${segment}`
            const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
            breadcrumbs.push({ label, href: currentPath })
        })

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    if (!mounted) {
        return (
            <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6">
                <div className="animate-pulse bg-slate-200 h-4 w-32 rounded" />
            </header>
        )
    }

    return (
        <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-4 md:px-6 gap-4 shadow-sm">
            {/* Left: Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-3">
                {/* Mobile Menu Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100/80">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side={lang === 'ar' ? "right" : "left"} className="p-0 w-72">
                        <Sidebar isSuperAdmin={isSuperAdmin} />
                    </SheetContent>
                </Sheet>

                {/* Mobile Brand */}
                <Link href="/crm" className="md:hidden font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Aqara+
                </Link>

                {/* Desktop Breadcrumbs */}
                <nav className="hidden md:flex items-center text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className={cn("h-4 w-4 mx-2 text-slate-400", lang === 'ar' && "rotate-180")} />
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="font-bold text-slate-900">{crumb.label}</span>
                            ) : (
                                <Link
                                    href={crumb.href}
                                    className="text-slate-500 hover:text-slate-700 transition-colors font-medium"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Center: Global Search (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
                <div className="relative w-full group">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder={t.common.search}
                        className="ps-10 bg-slate-50/80 border-border/60 rounded-xl h-11 focus:bg-white transition-all duration-300 hover:border-primary/30"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Mobile Search Button */}
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100/80">
                    <Search className="h-5 w-5 text-slate-600" />
                </Button>

                {/* Notifications */}
                <NotificationBell />

                {/* Theme Toggle (placeholder) */}
                <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-slate-100/80">
                    <Sun className="h-5 w-5 text-slate-600" />
                </Button>

                {/* User Navigation */}
                <UserNav isSuperAdmin={isSuperAdmin} userProfile={userProfile} />
            </div>
        </header>
    )
}
