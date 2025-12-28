import { Project } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, TrendingUp, Flame, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteProject } from "@/lib/actions"
import { toast } from "sonner"

interface ProjectCardProps {
    project: Project
    isAdmin?: boolean
}

export function ProjectCard({ project, isAdmin = false }: ProjectCardProps) {
    const formatPrice = (price?: number) => {
        if (!price) return "TBA"
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
        if (price >= 1000) return `${(price / 1000).toFixed(0)}K`
        return price.toString()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'selling': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'launching_soon': return 'bg-orange-50 text-orange-700 border-orange-200'
            case 'sold_out': return 'bg-slate-50 text-slate-700 border-slate-200'
            case 'hold': return 'bg-amber-50 text-amber-700 border-amber-200'
            default: return 'bg-slate-50 text-slate-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'selling': return <TrendingUp className="h-3 w-3 mr-1" />
            case 'launching_soon': return <Flame className="h-3 w-3 mr-1" />
            default: return null
        }
    }

    return (
        <Card className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Building2 className="h-12 w-12 opacity-20" />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 rounded-lg shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
                                    const res = await deleteProject(project.id)
                                    if (res.success) {
                                        toast.success("Project deleted")
                                    } else {
                                        toast.error(res.error || "Failed to delete project")
                                    }
                                }
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <Badge variant="outline" className={`capitalize font-bold px-2 py-0.5 text-[10px] shadow-sm backdrop-blur-md ${getStatusColor(project.market_status)}`}>
                        {getStatusIcon(project.market_status)}
                        {project.market_status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                        {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs font-medium text-slate-500">
                        <Building2 className="h-3 w-3 mr-1 text-slate-400" />
                        {project.developer?.name || "Private Developer"}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{project.location || "Location Not Specified"}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing From</p>
                        <p className="text-sm font-black text-slate-900">
                            {formatPrice(project.price_range_min)}
                            {project.price_range_max && project.price_range_max !== project.price_range_min && ` - ${formatPrice(project.price_range_max)}`}
                            <span className="text-[10px] ml-1 text-slate-500 font-bold">EGP</span>
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Link href={`/crm/inventory/${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full h-9 text-xs font-bold rounded-lg border-slate-200 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all group-hover:shadow-sm">
                        View Details
                        <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
