import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Home, Ruler, Banknote, User } from "lucide-react"
import Link from "next/link"
import { updateProperty, updatePropertyStatus } from "../actions"

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

    if (!property) return <div className="p-8 text-center font-bold">Property not found</div>

    const handleSold = async () => {
        'use server'
        await updatePropertyStatus(id, 'sold')
    }

    const handleReserved = async () => {
        'use server'
        await updatePropertyStatus(id, 'reserved')
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/crm/properties">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight truncate">{property.title}</h2>
                <Badge variant="outline" className="ml-2 capitalize">{property.status}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Info */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Price</span>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Banknote className="h-5 w-5 text-green-600" />
                                    {new Intl.NumberFormat("en-EG", { style: "currency", currency: property.currency || "EGP", maximumFractionDigits: 0 }).format(property.price)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Area</span>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-blue-600" />
                                    {property.area} m²
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Project</span>
                                <div className="font-medium">{property.project_name || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Location</span>
                                <div className="font-medium flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {property.location || '-'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <div className="font-medium capitalize">{property.type}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Bedrooms</span>
                                <div className="font-medium">{property.bedrooms || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Bathrooms</span>
                                <div className="font-medium">{property.bathrooms || '-'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar / Actions */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <form action={handleSold}>
                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={property.status === 'sold'}>
                                    Mark as Sold
                                </Button>
                            </form>
                            <form action={handleReserved}>
                                <Button type="submit" variant="outline" className="w-full" disabled={property.status === 'reserved' || property.status === 'sold'}>
                                    Mark as Reserved
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {property.listing_type === 'resale' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Owner Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-medium">{property.owner_contact || 'No contact info'}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
