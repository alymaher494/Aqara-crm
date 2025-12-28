"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Wallet } from "lucide-react"
import { Lead } from "@/types"

interface KanbanCardProps {
    lead: Lead
}

export function KanbanCard({ lead }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-3">
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                    </div>

                    {(lead.budget_min || lead.budget_max) && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <Wallet className="h-3 w-3" />
                            <span>
                                {lead.budget_max
                                    ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(lead.budget_max)
                                    : 'Budget Set'}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
