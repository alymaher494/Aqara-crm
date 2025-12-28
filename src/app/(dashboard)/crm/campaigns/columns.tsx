"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Campaign } from "@/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

export const columns: ColumnDef<Campaign>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <Link href={`/crm/campaigns/${row.original.id}`} className="font-medium hover:underline text-primary">
                    {row.getValue("name")}
                </Link>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "total_leads",
        header: "Total Leads",
    },
    {
        accessorKey: "sent_count",
        header: "Sent",
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            return format(new Date(row.getValue("created_at")), "dd/MM/yyyy")
        },
    },
]
