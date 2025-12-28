'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, Phone, Edit2, Trash2, ExternalLink } from "lucide-react"
import { Developer } from "@/types"
import { deleteDeveloper } from "@/lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { AddDeveloperDialog } from "./add-developer-dialog"

interface DeveloperCardProps {
    developer: Developer & { projects_count?: number }
    isAdmin: boolean
}

export function DeveloperCard({ developer, isAdmin }: DeveloperCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this developer?")) return

        setIsDeleting(true)
        const res = await deleteDeveloper(developer.id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Developer deleted successfully")
        }
        setIsDeleting(false)
    }

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-none bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-primary/20 transition-colors">
                    {developer.logo_url ? (
                        <img src={developer.logo_url} alt={developer.name} className="h-full w-full object-contain p-2" />
                    ) : (
                        <Building2 className="h-7 w-7 text-slate-300" />
                    )}
                </div>

                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg font-bold">
                    {developer.projects_count || 0} Projects
                </Badge>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{developer.name}</h3>

                <div className="space-y-1.5">
                    {developer.website && (
                        <a
                            href={developer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            <span className="truncate">{developer.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    )}
                    {developer.sales_hotline && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{developer.sales_hotline}</span>
                        </div>
                    )}
                </div>
            </div>

            {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <AddDeveloperDialog developer={developer}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/90 shadow-sm hover:bg-white hover:text-blue-600 transition-all">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </AddDeveloperDialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="h-8 w-8 rounded-lg bg-white/90 shadow-sm hover:bg-white hover:text-red-500 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </Card>
    )
}
