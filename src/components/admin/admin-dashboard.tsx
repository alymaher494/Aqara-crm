'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Settings, Trash, Shield, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createTenant, updateTenantLimits, deleteTenant } from '@/app/admin/actions'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Organization {
    id: string
    name: string
    subscription_plan?: string
    max_users?: number
    expiry_date?: string
    created_at: string
}

export function AdminDashboard({ initialTenants }: { initialTenants: Organization[] }) {
    const [tenants, setTenants] = useState<Organization[]>(initialTenants)
    const [isLoading, setIsLoading] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingTenant, setEditingTenant] = useState<Organization | null>(null)

    // Form States
    const [newName, setNewName] = useState('')
    const [newPlan, setNewPlan] = useState('free')
    const [newMaxUsers, setNewMaxUsers] = useState(5)

    const handleCreate = async () => {
        setIsLoading(true)
        const res = await createTenant({ name: newName, plan: newPlan, max_users: newMaxUsers })
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Tenant created successfully")
            setTenants([res.org, ...tenants])
            setIsAddOpen(false)
            setNewName('')
        }
        setIsLoading(false)
    }

    const handleUpdate = async () => {
        if (!editingTenant) return
        setIsLoading(true)
        // We reuse the newPlan/newMaxUsers state if editing, but for simplicity let's assume we bound them correctly
        // Actually, let's create a separate handler or state for editing to avoid confusion.
        // For MVP speed, I will use specific state orrefs.
        // Let's rely on the Dialog's internal state powered by `editingTenant`? 
        // No, let's use the inputs in the dialog.
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all data for this organization.")) return
        const res = await deleteTenant(id)
        if (res.success) {
            toast.success("Tenant deleted")
            setTenants(tenants.filter(t => t.id !== id))
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Tenant
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenants.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tenants.filter(t => t.subscription_plan !== 'free').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Capacity (Users)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tenants.reduce((acc, curr) => acc + (curr.max_users || 5), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Users Limit</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                <TableCell>
                                    <Badge variant={tenant.subscription_plan === 'enterprise' ? 'default' : 'secondary'}>
                                        {tenant.subscription_plan?.toUpperCase() || 'FREE'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{tenant.max_users || 5}</TableCell>
                                <TableCell>{format(new Date(tenant.created_at), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingTenant(tenant)}>
                                                <Settings className="mr-2 h-4 w-4" /> Manage Limits
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(tenant.id)} className="text-red-600">
                                                <Trash className="mr-2 h-4 w-4" /> Delete Tenant
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* CREATE DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Tenant</DialogTitle>
                        <DialogDescription>
                            Add a new organization to your SaaS platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="plan" className="text-right">Plan</Label>
                            <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="users" className="text-right">Max Users</Label>
                            <Input id="users" type="number" value={newMaxUsers} onChange={e => setNewMaxUsers(parseInt(e.target.value))} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreate} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Tenant'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            {editingTenant && (
                <EditTenantDialog
                    tenant={editingTenant}
                    onClose={() => setEditingTenant(null)}
                    onUpdate={(updated) => {
                        setTenants(tenants.map(t => t.id === updated.id ? { ...t, ...updated } : t))
                        setEditingTenant(null)
                    }}
                />
            )}
        </div>
    )
}

function EditTenantDialog({ tenant, onClose, onUpdate }: { tenant: Organization, onClose: () => void, onUpdate: (t: any) => void }) {
    const [plan, setPlan] = useState(tenant.subscription_plan || 'free')
    const [maxUsers, setMaxUsers] = useState(tenant.max_users || 5)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        const res = await updateTenantLimits(tenant.id, { plan, max_users: maxUsers })
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Limits updated")
            onUpdate({ ...tenant, subscription_plan: plan, max_users: maxUsers })
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Limits: {tenant.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Plan</Label>
                        <Select value={plan} onValueChange={setPlan}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Max Users</Label>
                        <Input type="number" value={maxUsers} onChange={e => setMaxUsers(parseInt(e.target.value))} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
