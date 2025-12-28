"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Property } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Property>[] = [
    {
        accessorKey: "project_name",
        header: () => {
            const { t } = useTranslation()
            return t.inventory.projectName
        },
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <Link href={`/crm/properties/${row.original.id}`} className="font-medium hover:underline text-primary">
                        {row.original.project_name || row.original.title}
                    </Link>
                    {row.original.unit_code && (
                        <span className="text-xs text-muted-foreground">Unit: {row.original.unit_code}</span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: () => {
            const { t } = useTranslation()
            return t.inventory.type
        },
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <Badge variant="outline" className="capitalize">
                    {type || 'N/A'}
                </Badge>
            )
        }
    },
    {
        accessorKey: "area",
        header: () => {
            const { lang } = useTranslation()
            return lang === 'ar' ? 'المساحة' : 'Area'
        },
        cell: ({ row }) => {
            const area = row.getValue("area") as number
            return <div className="text-sm">{area ? `${area} m²` : '-'}</div>
        }
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            const { lang } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ms-4"
                >
                    {lang === 'ar' ? 'السعر' : 'Price'}
                    <ArrowUpDown className="ms-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price")) || 0
            const formatted = new Intl.NumberFormat("en-EG", {
                style: "currency",
                currency: row.original.currency || "EGP",
                maximumFractionDigits: 0,
            }).format(price)
            return <div className="font-semibold">{formatted}</div>
        },
    },
    {
        accessorKey: "location",
        header: () => {
            const { t } = useTranslation()
            return t.inventory.location
        },
        cell: ({ row }) => {
            const location = row.getValue("location") as string
            return (
                <div className="text-sm text-muted-foreground max-w-[150px] truncate" title={location}>
                    {location || '-'}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: () => {
            const { t } = useTranslation()
            return t.inventory.status
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const statusConfig: Record<string, { bg: string; text: string }> = {
                available: { bg: 'bg-green-100', text: 'text-green-700' },
                sold: { bg: 'bg-red-100', text: 'text-red-700' },
                reserved: { bg: 'bg-amber-100', text: 'text-amber-700' },
            }
            const config = statusConfig[status] || statusConfig.available
            return (
                <Badge className={`${config.bg} ${config.text} hover:${config.bg} capitalize`}>
                    {status || 'available'}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { t, lang } = useTranslation()
            const property = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t.common.actions}</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/crm/properties/${property.id}`}>
                                <Eye className="me-2 h-4 w-4" /> {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/crm/properties/${property.id}/edit`}>
                                <Edit className="me-2 h-4 w-4" /> {t.common.edit}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="me-2 h-4 w-4" /> {t.common.delete}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
