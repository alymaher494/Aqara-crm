import { isSuperAdmin } from "@/lib/admin-actions"
import { redirect } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Globe, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const authorized = await isSuperAdmin()

    if (!authorized) {
        redirect('/crm')
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a]">
            {/* Super Admin Header - Dark & Premium */}
            <header className="border-b border-white/10 bg-[#1e293b] text-white sticky top-0 z-50 shadow-2xl">
                <div className="flex h-20 items-center px-4 md:px-12">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <ShieldAlert className="h-6 w-6 text-[#0f172a]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic">Master Control</h1>
                            <p className="text-[10px] text-amber-500 font-bold tracking-[0.2em] -mt-1">Global SaaS Engine</p>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-8 mx-12">
                        <Link href="/admin" className="text-sm font-bold transition-all hover:text-amber-400 border-b-2 border-amber-500 pb-1">
                            Organizations
                        </Link>
                        <Link href="/admin/system" className="text-sm font-bold text-slate-400 transition-all hover:text-white">
                            System Health
                        </Link>
                    </nav>

                    <div className="ml-auto flex items-center gap-4">
                        <Link href="/crm">
                            <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-amber-400 border-2 font-bold px-6">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                CRM Workspace
                            </Button>
                        </Link>
                        <div className="h-8 w-[1px] bg-white/10 mx-2" />
                        <Button variant="ghost" className="text-slate-400 hover:text-white">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content Area with a futuristic background hint */}
            <main className="flex-1 p-6 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(51,65,85,0.3),transparent)] pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
