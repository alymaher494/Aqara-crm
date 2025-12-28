'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateRole, toggleStatus, removeUser } from './actions'
import { toast } from 'sonner'
import { MoreHorizontal, Shield, User, UserX, UserCheck, Trash2 } from 'lucide-react'

interface TeamMemberActionsProps {
    userId: string
    currentRole: string
    isActive: boolean
    isCurrentUser: boolean
}

export function TeamMemberActions({ userId, currentRole, isActive, isCurrentUser }: TeamMemberActionsProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleRoleChange(newRole: 'manager' | 'agent') {
        if (currentRole === newRole) return
        setIsLoading(true)
        try {
            const result = await updateRole(userId, newRole)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Role updated to ${newRole}`)
            }
        } catch {
            toast.error('Failed to update role')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleToggleStatus() {
        setIsLoading(true)
        try {
            const result = await toggleStatus(userId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(isActive ? 'User deactivated' : 'User activated')
            }
        } catch {
            toast.error('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleRemove() {
        if (!confirm('Are you sure you want to remove this user from the team?')) return
        setIsLoading(true)
        try {
            const result = await removeUser(userId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('User removed from team')
            }
        } catch {
            toast.error('Failed to remove user')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Role Changes */}
                <DropdownMenuItem
                    onClick={() => handleRoleChange('manager')}
                    disabled={currentRole === 'manager' || isCurrentUser}
                >
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    Make Manager
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRoleChange('agent')}
                    disabled={currentRole === 'agent' || isCurrentUser}
                >
                    <User className="h-4 w-4 mr-2" />
                    Make Agent
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Status Toggle */}
                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={isCurrentUser}
                >
                    {isActive ? (
                        <>
                            <UserX className="h-4 w-4 mr-2 text-amber-500" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                            Activate
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Remove */}
                <DropdownMenuItem
                    onClick={handleRemove}
                    disabled={isCurrentUser}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
