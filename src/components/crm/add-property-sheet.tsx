"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createProperty } from "@/app/(dashboard)/crm/properties/actions"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

const propertySchema = z.object({
    title: z.string().min(2, "Title is required"),
    type: z.enum(['apartment', 'villa', 'townhouse', 'penthouse', 'chalet', 'office', 'commercial', 'land']),
    listing_type: z.enum(['primary', 'resale']),
    price: z.coerce.number().min(1, "Price is required"),
    currency: z.string().default("EGP"),
    area: z.coerce.number().min(1, "Area is required"),
    project_name: z.string().optional(),
    developer_name: z.string().optional(),
    location: z.string().optional(),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    finishing: z.string().optional(),
    owner_contact: z.string().optional(),
})

export function AddPropertySheet() {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<z.infer<typeof propertySchema>>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            type: "apartment",
            listing_type: "primary",
            currency: "EGP",
            price: 0,
            area: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof propertySchema>) {
        setIsSaving(true)
        try {
            const result = await createProperty(values as any)
            if (result.success) {
                toast.success("Property added successfully")
                setOpen(false)
                form.reset()
            } else {
                toast.error(result.error || "Failed to add property")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const listingType = form.watch("listing_type")

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Property
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle>Add New Property</SheetTitle>
                    <SheetDescription>
                        Add a new unit to your inventory.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Basic Info</h3>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Luxury Apartment in Zayed" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="apartment">Apartment</SelectItem>
                                                        <SelectItem value="villa">Villa</SelectItem>
                                                        <SelectItem value="townhouse">Townhouse</SelectItem>
                                                        <SelectItem value="penthouse">Penthouse</SelectItem>
                                                        <SelectItem value="chalet">Chalet</SelectItem>
                                                        <SelectItem value="office">Office</SelectItem>
                                                        <SelectItem value="commercial">Commercial</SelectItem>
                                                        <SelectItem value="land">Land</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="listing_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Listing Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select listing type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="primary">Primary</SelectItem>
                                                        <SelectItem value="resale">Resale</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Price & Area */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Price & Area</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area (m²)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                                <FormField
                                    control={form.control}
                                    name="project_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Palm Hills" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location / Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Sheikh Zayed" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Specs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Specs</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bedrooms"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Beds</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bathrooms"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Baths</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="finishing"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Finishing</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="core_shell">Core & Shell</SelectItem>
                                                        <SelectItem value="semi_finished">Semi Finished</SelectItem>
                                                        <SelectItem value="finished">Finished</SelectItem>
                                                        <SelectItem value="furnished">Furnished</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Owner Info (Resale Only) */}
                            {listingType === 'resale' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Owner Info</h3>
                                    <FormField
                                        control={form.control}
                                        name="owner_contact"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Owner Contact</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Name & Phone" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Property
                            </Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
