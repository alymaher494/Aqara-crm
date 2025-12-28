'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, Building, MapPin, BadgeDollarSign, Info } from "lucide-react"
import { getDevelopers } from "@/app/(dashboard)/crm/inventory/actions"
import { createProject } from "@/lib/actions"
import { Developer } from "@/types"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export function AddProjectDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [developers, setDevelopers] = useState<Developer[]>([])
    const [fetchingDevs, setFetchingDevs] = useState(false)

    useEffect(() => {
        if (open) {
            setFetchingDevs(true)
            getDevelopers().then(res => {
                if (res.data) setDevelopers(res.data)
                setFetchingDevs(false)
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            developer_id: formData.get('developer_id') as string,
            location: formData.get('location') as string,
            market_status: formData.get('market_status') as any,
            price_range_min: Number(formData.get('price_min')),
            price_range_max: Number(formData.get('price_max')),
            description: formData.get('description') as string,
        }

        if (!data.developer_id || data.developer_id === 'none') {
            toast.error("Please select a developer")
            setLoading(false)
            return
        }

        const res = await createProject(data)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Project added successfully")
            setOpen(false)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="bg-slate-50/50 px-6 py-6 border-b">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Launch New Project
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            Create a new project listing for the Market Inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-5">
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                    Project Name
                                </Label>
                                <Input id="name" name="name" required placeholder="e.g., Al Burouj, Il Bosco" className="rounded-xl bg-slate-50/50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="developer" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                        Developer
                                    </Label>
                                    <Select name="developer_id" required>
                                        <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-200 h-11">
                                            <SelectValue placeholder={fetchingDevs ? "Loading..." : "Select Developer"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {developers.map((dev) => (
                                                <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                                            ))}
                                            {developers.length === 0 && !fetchingDevs && (
                                                <SelectItem value="none" disabled>No developers found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                        Market Status
                                    </Label>
                                    <Select name="market_status" defaultValue="selling">
                                        <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-200 h-11">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="selling">Selling</SelectItem>
                                            <SelectItem value="launching_soon">Launching Soon</SelectItem>
                                            <SelectItem value="sold_out">Sold Out</SelectItem>
                                            <SelectItem value="hold">On Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                    Location
                                    <MapPin className="h-3 w-3" />
                                </Label>
                                <Input id="location" name="location" placeholder="e.g., New Cairo, Mostakbal City" className="rounded-xl bg-slate-50/50 border-slate-200 h-11" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price_min" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                        Min Price (EGP)
                                    </Label>
                                    <Input id="price_min" name="price_min" type="number" placeholder="4000000" className="rounded-xl bg-slate-50/50 border-slate-200 h-11" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_max" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                        Max Price (EGP)
                                    </Label>
                                    <Input id="price_max" name="price_max" type="number" placeholder="12000000" className="rounded-xl bg-slate-50/50 border-slate-200 h-11" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                    Description / Sales Notes
                                </Label>
                                <Textarea id="description" name="description" placeholder="Project features, installment plans, etc." className="rounded-xl bg-slate-50/50 border-slate-200 min-h-[100px]" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50/50 px-6 py-4 border-t gap-3 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
