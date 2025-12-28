import { createClient } from "@/lib/supabase/server"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Building2, Home, DollarSign, MapPin } from "lucide-react"
import { AddPropertySheet } from "@/components/crm/add-property-sheet"

export default async function PropertiesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8">Please log in.</div>

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return <div className="p-8">No Organization Found</div>

    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    const propertyList = properties || []

    // Calculate stats
    const totalProperties = propertyList.length
    const availableCount = propertyList.filter(p => p.status === 'available').length
    const soldCount = propertyList.filter(p => p.status === 'sold').length
    const totalValue = propertyList.reduce((sum, p) => sum + (p.price || 0), 0)

    // Format currency
    const formattedValue = new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
    }).format(totalValue)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage your property listings</p>
                </div>
                <AddPropertySheet />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProperties}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                        <Home className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Sold</CardTitle>
                        <MapPin className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{soldCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formattedValue}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Properties Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    {propertyList.length === 0 ? (
                        <EmptyState
                            icon={Building2}
                            title="No properties found"
                            description="Your inventory is empty. Add your first property listing."
                            action={<AddPropertySheet />}
                        />
                    ) : (
                        <DataTable columns={columns} data={propertyList} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
