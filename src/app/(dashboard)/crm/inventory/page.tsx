import { createClient } from "@/lib/supabase/server"
import { getProjects, getProperties } from "./actions"
import { ProjectCard } from "@/components/crm/project-card"
import { AddProjectDialog } from "@/components/crm/add-project-dialog"
import { Input } from "@/components/ui/input"
import { Search, Building2, LayoutGrid, ListFilter, Home, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "../properties/data-table"
import { columns } from "../properties/columns"
import { AddPropertySheet } from "@/components/crm/add-property-sheet"

export default async function InventoryPage() {
    // 1. Fetch Parallel Data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [
        { data: projects, error: projectsError },
        { data: properties, error: propertiesError },
        { data: profile }
    ] = await Promise.all([
        getProjects(),
        getProperties(),
        supabase.from('profiles').select('role').eq('id', user?.id).single()
    ])

    const isAdmin = profile?.role === 'admin'

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0 text-[10px] uppercase tracking-wider">
                            Real Estate Intelligence
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Market Inventory</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        Explore and manage primary projects and secondary resale units.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddProjectDialog />
                </div>
            </div>

            <Tabs defaultValue="projects" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <TabsList className="bg-slate-100/50 p-1 h-12 rounded-xl border border-slate-200/50">
                        <TabsTrigger value="projects" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            <Building className="h-4 w-4 mr-2" />
                            Projects (Primary)
                        </TabsTrigger>
                        <TabsTrigger value="resale" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                            <Home className="h-4 w-4 mr-2" />
                            Resale / Units
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto px-2">
                        <div className="relative w-full sm:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-9 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium"
                            />
                        </div>
                        <Badge variant="outline" className="h-9 px-3 border-slate-200 bg-white rounded-lg text-slate-600 font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                            <ListFilter className="h-3.5 w-3.5" />
                            Filter
                        </Badge>
                    </div>
                </div>

                <TabsContent value="projects" className="space-y-6 border-none p-0 outline-none">
                    {projectsError ? (
                        <div className="p-12 text-center bg-red-50 border border-red-100 rounded-3xl">
                            <p className="text-red-600 font-bold">Error loading inventory: {projectsError}</p>
                        </div>
                    ) : projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project as any} isAdmin={isAdmin} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm shadow-slate-200 border border-slate-100">
                                <Building2 className="h-10 w-10 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">
                                    Start building your market inventory by adding your first project launch.
                                </p>
                            </div>
                            <div className="pt-2">
                                <AddProjectDialog />
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="resale" className="space-y-6 border-none p-0 outline-none">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Individual Units</h3>
                                <p className="text-sm text-slate-500">Secondary market and individual resale listings.</p>
                            </div>
                            <AddPropertySheet />
                        </div>
                        <div className="p-0">
                            {propertiesError ? (
                                <div className="p-12 text-center text-red-600 font-bold">
                                    Error loading units: {propertiesError}
                                </div>
                            ) : (
                                <DataTable columns={columns} data={properties || []} />
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
