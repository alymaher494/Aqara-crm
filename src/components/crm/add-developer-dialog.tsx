'use client'

import { useState } from "react"
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
import { PlusCircle, Loader2, Building2, Globe, Image as ImageIcon, Phone } from "lucide-react"
import { upsertDeveloper } from "@/lib/actions"
import { Developer } from "@/types"
import { toast } from "sonner"

interface AddDeveloperDialogProps {
    developer?: Developer
    children?: React.ReactNode
}

export function AddDeveloperDialog({ developer, children }: AddDeveloperDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: Partial<Developer> = {
            id: developer?.id,
            name: formData.get('name') as string,
            website: formData.get('website') as string,
            logo_url: formData.get('logo_url') as string,
            sales_hotline: formData.get('sales_hotline') as string,
        }

        const res = await upsertDeveloper(data)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(developer ? "Developer updated" : "Developer added")
            setOpen(false)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Developer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="bg-slate-50/50 px-6 py-6 border-b">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {developer ? "Edit Developer" : "New Developer Partner"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            {developer ? "Update developer information." : "Register a new real-estate developer in your inventory."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                Developer Name *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                defaultValue={developer?.name}
                                placeholder="e.g., Emaar, Sodic"
                                className="rounded-xl bg-slate-50/50 border-slate-200 h-11 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                Website <Globe className="h-3 w-3" />
                            </Label>
                            <Input
                                id="website"
                                name="website"
                                defaultValue={developer?.website}
                                placeholder="https://emaar.com"
                                className="rounded-xl bg-slate-50/50 border-slate-200 h-11"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo_url" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                Logo URL <ImageIcon className="h-3 w-3" />
                            </Label>
                            <Input
                                id="logo_url"
                                name="logo_url"
                                defaultValue={developer?.logo_url}
                                placeholder="Link to logo image"
                                className="rounded-xl bg-slate-50/50 border-slate-200 h-11"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sales_hotline" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 ml-1">
                                Sales Hotline <Phone className="h-3 w-3" />
                            </Label>
                            <Input
                                id="sales_hotline"
                                name="sales_hotline"
                                defaultValue={developer?.sales_hotline}
                                placeholder="e.g., 19XXX"
                                className="rounded-xl bg-slate-50/50 border-slate-200 h-11"
                            />
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50/50 px-6 py-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (developer ? "Save Changes" : "Create Developer")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
