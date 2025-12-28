'use client'

import { useState, useEffect } from 'react'
import { User, Loader2, UserX } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getTeamMembers, assignLead } from '@/app/(dashboard)/crm/leads/actions'
import { toast } from 'sonner'

// Special value for "unassigned" since SelectItem cannot have empty string
const UNASSIGNED_VALUE = '__unassigned__'

interface TeamMember {
    id: string
    full_name: string | null
}

interface AssignAgentSelectorProps {
    leadId: string
    currentAssignedTo: string | null
}

export function AssignAgentSelector({ leadId, currentAssignedTo }: AssignAgentSelectorProps) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    // Use special value for unassigned instead of empty string
    const [selectedAgent, setSelectedAgent] = useState(currentAssignedTo || UNASSIGNED_VALUE)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function fetchTeamMembers() {
            setIsLoading(true)
            const members = await getTeamMembers()
            // Filter out any members with missing or empty IDs
            const validMembers = members.filter(
                (m): m is TeamMember => Boolean(m.id && m.id.trim() !== '')
            )
            setTeamMembers(validMembers)
            setIsLoading(false)
        }
        fetchTeamMembers()
    }, [])

    // Get display name for current selection
    const getDisplayName = (agentId: string) => {
        if (agentId === UNASSIGNED_VALUE || !agentId) {
            return null
        }
        const member = teamMembers.find(m => m.id === agentId)
        return member?.full_name || 'Unknown'
    }

    async function handleAssign(value: string) {
        setIsSaving(true)
        // Convert special unassigned value back to null for DB
        const agentId = value === UNASSIGNED_VALUE ? null : value

        try {
            await assignLead(leadId, agentId)
            toast.success(agentId ? 'Agent assigned successfully' : 'Agent removed')
            setSelectedAgent(value)
        } catch (error) {
            toast.error('Failed to assign agent')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading agents...</span>
            </div>
        )
    }

    const displayName = getDisplayName(selectedAgent)

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
            <Select
                value={selectedAgent}
                onValueChange={handleAssign}
                disabled={isSaving}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agent...">
                        {displayName ? (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {displayName}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UserX className="h-4 w-4" />
                                Unassigned
                            </div>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {/* Unassigned option with non-empty special value */}
                    <SelectItem value={UNASSIGNED_VALUE}>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UserX className="h-4 w-4" />
                            Unassigned
                        </div>
                    </SelectItem>
                    {/* Team members with valid IDs */}
                    {teamMembers.map((member) => (
                        <SelectItem
                            key={member.id}
                            value={member.id || `fallback-${Math.random()}`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {member.full_name || 'Unknown'}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
