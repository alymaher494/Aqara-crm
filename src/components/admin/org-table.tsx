'use client'

import { useState } from 'react'
import { Organization } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { updateOrgStatus } from '@/lib/admin-actions'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface OrgTableProps {
    organizations: Organization[]
}

export function OrgTable({ organizations }: OrgTableProps) {
    const [orgs, setOrgs] = useState(organizations)

    const handleStatusToggle = async (orgId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

        // Optimistic update
        setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: newStatus } : o))

        const result = await updateOrgStatus(orgId, newStatus)

        if (result.error) {
            toast.error(`Failed to update status: ${result.error}`)
            // Rollback
            setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: currentStatus } : o))
        } else {
            toast.success(`Organization ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`)
        }
    }

    return (
        <div className="bg-[#1e293b]/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="text-slate-400 font-bold py-6">Organization Name</TableHead>
                        <TableHead className="text-slate-400 font-bold">Plan</TableHead>
                        <TableHead className="text-slate-400 font-bold">Status</TableHead>
                        <TableHead className="text-slate-400 font-bold">Created At</TableHead>
                        <TableHead className="text-right text-slate-400 font-bold px-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orgs.map((org) => (
                        <TableRow key={org.id} className="hover:bg-white/5 border-white/5 transition-colors">
                            <TableCell className="font-bold text-white py-4">{org.name}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "capitalize font-bold",
                                        org.subscription_plan === 'pro' ? "border-amber-500/50 text-amber-500 bg-amber-500/10" : "border-slate-500/50 text-slate-400"
                                    )}
                                >
                                    {org.subscription_plan}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        "font-bold px-3",
                                        (org as any).status === 'active' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                    )}
                                >
                                    {(org as any).status || 'active'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-400 text-xs font-medium">
                                {format(new Date(org.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right px-8">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                        {(org as any).status === 'suspended' ? 'Suspended' : 'Active'}
                                    </span>
                                    <Switch
                                        checked={(org as any).status !== 'suspended'}
                                        onCheckedChange={() => handleStatusToggle(org.id, (org as any).status || 'active')}
                                        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-slate-700"
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {orgs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-20 text-slate-500 font-bold">
                                No organizations found in the system.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
