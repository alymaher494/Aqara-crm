import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Check Admin Status
    const { data: adminRecord } = await supabase
        .from('app_admins')
        .select('id')
        .eq('user_id', user.id)
        .single()

    const isSuperAdmin = !!adminRecord

    return (
        <div className="h-screen flex bg-slate-50/50">
            {/* Desktop Sidebar - Fixed on left */}
            <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 start-0 z-50">
                <Sidebar isSuperAdmin={isSuperAdmin} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ps-64 flex flex-col min-h-screen">
                {/* Header - Contains mobile menu trigger */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}