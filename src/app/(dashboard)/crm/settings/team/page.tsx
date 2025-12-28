import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { InviteUserDialog } from '@/components/crm/invite-user-dialog'
import { TeamMemberActions } from './team-member-actions'
import { Users, UserCheck, UserX } from 'lucide-react'

export default async function TeamPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-8">Please log in.</div>
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return <div className="p-8">No organization found.</div>
    }

    // Fetch team members
    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    const teamMembers = members || []
    const activeCount = teamMembers.filter(m => m.is_active !== false).length
    const managerCount = teamMembers.filter(m => m.role === 'manager').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">Manage your team and their permissions</p>
                </div>
                <InviteUserDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Managers</CardTitle>
                        <UserX className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{managerCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Team Members</CardTitle>
                    <CardDescription>
                        A list of all team members in your organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No team members yet. Invite someone to get started!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teamMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={member.avatar_url} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600">
                                                            {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{member.full_name || 'Unnamed User'}</p>
                                                        {member.is_invited && (
                                                            <p className="text-xs text-amber-600">Pending Invite</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {member.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={member.role === 'manager' ? 'default' : 'secondary'}
                                                    className={member.role === 'manager' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                                >
                                                    {member.role === 'manager' ? 'Manager' : 'Agent'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={member.is_active !== false ? 'default' : 'destructive'}
                                                    className={member.is_active !== false ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                >
                                                    {member.is_active !== false ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TeamMemberActions
                                                    userId={member.id}
                                                    currentRole={member.role}
                                                    isActive={member.is_active !== false}
                                                    isCurrentUser={member.id === user.id}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
