"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lead } from "@/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar,
    User as UserIcon,
    Shield,
    Phone,
    MessageCircle,
    MoreHorizontal,
    Trash2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { updateLeadComments, logActivity } from "./actions"
import { deleteLead } from "@/lib/actions"
import { toast } from "sonner"

function QuickEditInsights({ lead }: { lead: Lead }) {
    const [clientComment, setClientComment] = useState(lead.client_comment || "")
    const [salesComment, setSalesComment] = useState(lead.sales_comment || "")
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        setIsSaving(true)
        try {
            await updateLeadComments(lead.id, {
                client_comment: clientComment,
                sales_comment: salesComment
            })
            toast.success("Insights updated")
        } catch (error) {
            toast.error("Failed to update insights")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4 p-4 w-[300px]" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 uppercase tracking-wider text-slate-500">
                    <UserIcon className="h-3 w-3" /> Client Inquiry
                </label>
                <Textarea
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    placeholder="What the client asked for..."
                    className="text-xs min-h-[80px] bg-slate-50 border-slate-200"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-1 uppercase tracking-wider text-slate-500">
                    <Shield className="h-3 w-3" /> Sales Note (Internal)
                </label>
                <Textarea
                    value={salesComment}
                    onChange={(e) => setSalesComment(e.target.value)}
                    placeholder="Agent feedback..."
                    className="text-xs min-h-[80px] bg-slate-50 border-slate-200"
                />
            </div>
            <Button size="sm" className="w-full text-xs font-bold" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Insights"}
            </Button>
        </div>
    )
}

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">#{row.original.id.slice(0, 5)}</span>,
    },
    {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
            const lead = row.original

            const handleContactClick = async (type: string) => {
                try {
                    await logActivity(lead.id, type, `Clicked ${type === 'call_attempt' ? 'phone' : 'WhatsApp'}`)
                    toast.success(type === 'call_attempt' ? "Call logged" : "WhatsApp logged")
                } catch (e) {
                    // silent fail
                }
            }

            return (
                <div className="flex flex-col">
                    <Link href={`/crm/leads/${lead.id}`} className="font-bold hover:underline text-slate-900">
                        {lead.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                        <a
                            href={`tel:${lead.phone}`}
                            onClick={() => handleContactClick('call_attempt')}
                            className="text-xs text-slate-500 hover:text-primary flex items-center gap-1"
                        >
                            <Phone className="h-3 w-3" /> {lead.phone}
                        </a>
                        <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleContactClick('whatsapp_opened')}
                            className="text-green-600 hover:text-green-700 transition-transform hover:scale-110"
                        >
                            <MessageCircle className="h-3 w-3 fill-current" />
                        </a>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                new: "default",
                contacted: "secondary",
                won: "outline",
                lost: "destructive",
            }
            return (
                <Badge variant={variants[status] || "secondary"} className="capitalize">
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "interested_in",
        header: "Project",
        cell: ({ row }) => row.original.interested_in || "N/A",
    },
    {
        id: "next_action",
        header: "Next Action",
        cell: ({ row }) => {
            const tasks = (row.original as any).tasks || []
            const incompleteTasks = tasks
                .filter((t: any) => !t.is_completed)
                .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

            if (incompleteTasks.length === 0) return <span className="text-xs text-muted-foreground">No Action</span>

            const nextTask = incompleteTasks[0]
            return (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Calendar className="h-3 w-3 text-primary" />
                    {format(new Date(nextTask.due_date), "dd/MM p")}
                </div>
            )
        },
    },
    {
        accessorKey: "assigned_to",
        header: "Assigned To",
        cell: ({ row }) => {
            const profile = (row.original as any).assigned_profile
            if (!profile) return <span className="text-xs text-muted-foreground">Unassigned</span>

            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-slate-100">
                            {profile.full_name?.charAt(0) || <UserIcon className="h-3 w-3" />}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{profile.full_name || 'Agent'}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "notes",
        header: "Summary",
        cell: ({ row }) => {
            const notes = row.original.notes || ""
            const truncated = notes.length > 20 ? notes.slice(0, 20) + "..." : notes
            if (!notes) return <span className="text-xs text-muted-foreground">-</span>

            return (
                <div className="group relative">
                    <span className="text-xs cursor-help border-b border-dotted" title={notes}>
                        {truncated}
                    </span>
                </div>
            )
        },
    },
    {
        id: "insights",
        header: "Insights",
        cell: ({ row }) => {
            const lead = row.original

            return (
                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 hover:bg-slate-100 group">
                                <div className="flex items-center gap-1">
                                    <div title={lead.client_comment || "No client inquiry"}>
                                        <UserIcon
                                            className={`h-3.5 w-3.5 ${lead.client_comment ? 'text-indigo-600 fill-indigo-50' : 'text-slate-300'}`}
                                        />
                                    </div>
                                    <div title={lead.sales_comment || "No internal feedback"}>
                                        <Shield
                                            className={`h-3.5 w-3.5 ${lead.sales_comment ? 'text-amber-500 fill-amber-50' : 'text-slate-300'}`}
                                        />
                                    </div>
                                </div>
                                <MoreHorizontal className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="p-0 border shadow-2xl bg-white min-w-[320px]">
                            <DropdownMenuLabel className="bg-slate-50/50 p-3 flex justify-between items-center text-xs font-bold text-slate-700">
                                <span>Insights & Strategy</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-red-600 transition-colors"
                                    onClick={async () => {
                                        if (window.confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
                                            const res = await deleteLead(lead.id)
                                            if (res.success) {
                                                toast.success("Lead deleted successfully")
                                            } else {
                                                toast.error(res.error || "Failed to delete lead")
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="m-0" />
                            <QuickEditInsights lead={lead} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]
