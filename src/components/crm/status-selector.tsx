'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateLeadStatus } from "@/app/(dashboard)/crm/leads/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export function StatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
    const router = useRouter()

    async function handleStatusChange(value: string) {
        try {
            await updateLeadStatus(id, value)
            toast.success(`Status updated to ${value}`)
            router.refresh()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    return (
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
