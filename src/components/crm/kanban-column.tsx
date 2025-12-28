"use client"

import { useDroppable } from "@dnd-kit/core"
import { KanbanCard } from "./kanban-card"
import { Lead } from "@/types"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
    id: string
    title: string
    leads: Lead[]
    color?: string
    hideHeader?: boolean
}

export function KanbanColumn({
    id,
    title,
    leads,
    color = "bg-slate-500",
    hideHeader = false
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    })

    return (
        <div
            className={cn(
                "flex flex-col h-full rounded-xl border bg-white overflow-hidden transition-all duration-200",
                isOver && "ring-2 ring-blue-400 shadow-lg scale-[1.01]"
            )}
        >
            {/* Column Header */}
            {!hideHeader && (
                <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                        <span className="font-medium text-sm text-slate-700">{title}</span>
                    </div>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {leads.length}
                    </span>
                </div>
            )}

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-2 overflow-y-auto space-y-2",
                    hideHeader ? "min-h-0" : "min-h-[150px]"
                )}
            >
                {leads.map((lead) => (
                    <KanbanCard key={lead.id} lead={lead} />
                ))}
                {leads.length === 0 && (
                    <div className="h-16 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-muted-foreground text-xs">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    )
}
