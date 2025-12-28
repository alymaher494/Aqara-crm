import { createClient } from "@/lib/supabase/server"
import { getDevelopersWithCount } from "@/lib/actions"
import { DeveloperCard } from "@/components/crm/developer-card"
import { AddDeveloperDialog } from "@/components/crm/add-developer-dialog"
import { Input } from "@/components/ui/input"
import { Search, Building2, LayoutGrid, ListFilter } from "lucide-react"

export default async function DevelopersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const supabase = await createClient()

    // 1. Fetch User and Role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    // 2. Fetch Developers
    const { data: developers, error } = await getDevelopersWithCount(searchParams.q)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <Building2 className="h-4 w-4" />
                        Inventory Module
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Real-Estate <span className="text-primary">Developers</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Manage your developer partners and analyze their market presence.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <form action="/crm/developers" method="GET">
                            <Input
                                name="q"
                                placeholder="Search developers..."
                                defaultValue={searchParams.q}
                                className="ps-10 w-full md:w-64 lg:w-80 h-12 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                            />
                        </form>
                    </div>
                    {isAdmin && (
                        <AddDeveloperDialog />
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-center">
                    <p className="text-red-600 font-bold">{error}</p>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {developers?.map((developer) => (
                    <DeveloperCard
                        key={developer.id}
                        developer={developer}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            {/* Empty State */}
            {developers?.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
                        <Building2 className="h-10 w-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No developers found</h2>
                    <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">
                        {searchParams.q
                            ? `We couldn't find any developer matching "${searchParams.q}"`
                            : "It seems you haven't added any developers to your inventory yet."
                        }
                    </p>
                    {isAdmin && !searchParams.q && (
                        <AddDeveloperDialog />
                    )}
                </div>
            )}
        </div>
    )
}
