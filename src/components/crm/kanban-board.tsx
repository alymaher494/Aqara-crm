"use client"

import { useState, useMemo } from "react"
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { Lead } from "@/types"
import { updateLeadStatus } from "@/app/(dashboard)/crm/leads/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Inbox, GitBranch } from "lucide-react"

interface KanbanBoardProps {
    initialLeads: Lead[]
}

const COLUMNS = [
    { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
    { id: 'meeting', title: 'Meeting', color: 'bg-purple-500' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-500' },
    { id: 'won', title: 'Won', color: 'bg-green-500' },
]

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [activeLead, setActiveLead] = useState<Lead | null>(null)
    const [newLeadsSearch, setNewLeadsSearch] = useState("")

    // Use both Pointer and Touch sensors for better mobile support
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    // Filter new leads by search term
    const filteredNewLeads = useMemo(() => {
        const newLeads = leads.filter((l) => l.status === 'new')
        if (!newLeadsSearch.trim()) return newLeads

        const search = newLeadsSearch.toLowerCase()
        return newLeads.filter(
            (lead) =>
                lead.phone?.toLowerCase().includes(search) ||
                lead.name?.toLowerCase().includes(search)
        )
    }, [leads, newLeadsSearch])

    // Get other columns' leads
    const otherColumns = COLUMNS.filter(c => c.id !== 'new')

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        const lead = leads.find((l) => l.id === active.id)
        if (lead) setActiveLead(lead)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveLead(null)

        if (!over) return

        const leadId = active.id as string
        const newStatus = over.id as string

        const lead = leads.find((l) => l.id === leadId)
        if (!lead || lead.status === newStatus) return

        // Optimistic Update
        setLeads((prev) =>
            prev.map((l) =>
                l.id === leadId ? { ...l, status: newStatus as any } : l
            )
        )

        try {
            await updateLeadStatus(leadId, newStatus)
            toast.success(`Lead moved to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update status")
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === leadId ? { ...l, status: lead.status } : l
                )
            )
        }
    }

    // New Leads Panel Content
    const NewLeadsContent = () => (
        <div className="flex flex-col h-full bg-blue-50/50 rounded-xl border-2 border-blue-200 overflow-hidden">
            <div className="p-4 bg-white border-b border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h2 className="font-bold text-lg text-slate-800">New Leads</h2>
                    <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {filteredNewLeads.length}
                    </span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by phone or name..."
                        value={newLeadsSearch}
                        onChange={(e) => setNewLeadsSearch(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <KanbanColumn
                    id="new"
                    title=""
                    leads={filteredNewLeads}
                    color="bg-blue-500"
                    hideHeader
                />
            </div>
        </div>
    )

    // Pipeline Grid Content
    const PipelineContent = () => (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200">
                <h2 className="font-bold text-lg text-slate-800">Pipeline</h2>
                <p className="text-sm text-muted-foreground">Drag leads between stages</p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 overflow-y-auto">
                {otherColumns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        leads={leads.filter((l) => l.status === col.id)}
                        color={col.color}
                    />
                ))}
            </div>
        </div>
    )

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Mobile View: Tabs */}
            <div className="md:hidden">
                <Tabs defaultValue="new" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="new" className="flex items-center gap-2">
                            <Inbox className="h-4 w-4" />
                            New ({filteredNewLeads.length})
                        </TabsTrigger>
                        <TabsTrigger value="pipeline" className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            Pipeline
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="new" className="h-[calc(100vh-16rem)]">
                        <NewLeadsContent />
                    </TabsContent>
                    <TabsContent value="pipeline" className="h-[calc(100vh-16rem)]">
                        <PipelineContent />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop View: Split Layout */}
            <div className="hidden md:flex gap-4 h-[calc(100vh-12rem)]">
                {/* Left: New Leads Zone (40%) */}
                <div className="w-[40%]">
                    <NewLeadsContent />
                </div>

                {/* Right: Pipeline Zone (60%) */}
                <div className="w-[60%]">
                    <PipelineContent />
                </div>
            </div>

            <DragOverlay>
                {activeLead ? <KanbanCard lead={activeLead} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
