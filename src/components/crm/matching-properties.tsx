"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { savePreferences, getMatchingInventory } from "@/app/(dashboard)/crm/leads/[id]/actions"
import { Loader2, Search, Send, ExternalLink, AlertCircle, Building2, BadgeDollarSign, MapPin, Sparkles, CheckCircle2, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const preferencesSchema = z.object({
    budget: z.coerce.number().min(0, "Budget must be a positive number"),
    interested_in: z.string().optional(),
})

interface MatchingPropertiesProps {
    lead: any
}

export function MatchingProperties({ lead }: MatchingPropertiesProps) {
    const [matches, setMatches] = useState<any[]>([])
    const [isLoadingMatches, setIsLoadingMatches] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof preferencesSchema>>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            budget: lead.budget || lead.max_budget || 0,
            interested_in: lead.interested_in || "",
        },
    })

    const fetchMatches = async () => {
        setIsLoadingMatches(true)
        setFetchError(null)
        try {
            const result = await getMatchingInventory(lead.id)
            if (result.error) {
                setFetchError(result.error)
            } else {
                setMatches(result.projects || [])
            }
        } catch (err: any) {
            setFetchError(err.message)
        } finally {
            setIsLoadingMatches(false)
        }
    }

    useEffect(() => {
        fetchMatches()
    }, [lead.id])

    async function onSubmit(values: z.infer<typeof preferencesSchema>) {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append('maxBudget', values.budget.toString()) // Keep compatibility with existing server action
            if (values.interested_in) formData.append('location', values.interested_in)

            const result = await savePreferences(lead.id, formData)

            if (result.message === 'success') {
                toast.success("Lead preferences updated")
                fetchMatches()
            } else {
                toast.error(result.message || "Failed to update")
            }
        } catch (error) {
            toast.error("Error updating preferences")
        } finally {
            setIsSaving(false)
        }
    }

    const formatPrice = (price?: number) => {
        if (!price) return "TBA"
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
        if (price >= 1000) return `${(price / 1000).toFixed(0)}K`
        return price.toString()
    }

    const handleWhatsApp = (project: any) => {
        const message = `Hello ${lead.name}, based on your budget of ${formatPrice(lead.budget || lead.max_budget)}, I highly recommend checking out ${project.name} by ${project.developer?.name || 'the developer'}. It matches your profile. Check it out here.`
        const url = `https://wa.me/${lead.phone.replace('+', '')}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <div className="space-y-8 pb-10">
            {/* 1. Relevance Header & Preferences */}
            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Smart Matching Engine</h2>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Found {matches.length} projects tailored to {lead.name}&apos;s budget and location preferences.
                    </p>
                </div>
                <div className="md:col-span-4">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardContent className="p-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="budget"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] font-bold text-slate-400 uppercase">Lead Budget</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="h-9 font-bold bg-slate-50" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="h-9 font-bold" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-Match"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 2. Suggested Projects Grid */}
            {isLoadingMatches ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse border-slate-100">
                            <div className="aspect-video bg-slate-100" />
                            <CardContent className="p-6 space-y-4">
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : fetchError ? (
                <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100 text-red-600">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="font-bold">Matching Engine Error</p>
                    <p className="text-sm opacity-80 mt-1">{fetchError}</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Projects found in budget</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-1">Try increasing the budget to discover potential launches.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {matches.map((project) => (
                        <Card key={project.id} className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 bg-white flex flex-col">
                            {/* Project Thumbnail Placeholder */}
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <Building2 className="h-12 w-12 opacity-20" />
                                </div>
                                <div className="absolute top-3 left-3">
                                    <Badge className={`font-black text-[10px] uppercase shadow-sm ${project.matchLevel === '100% Match'
                                            ? 'bg-emerald-500 hover:bg-emerald-500'
                                            : 'bg-amber-500 hover:bg-amber-500'
                                        }`}>
                                        {project.matchLevel === '100% Match' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {project.matchLevel}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="p-5 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                                        <Building2 className="h-3 w-3" />
                                        {project.developer?.name || "Private Developer"}
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">
                                        {project.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 pt-2 flex-1 space-y-4">
                                <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                                    <span className="truncate">{project.location || "Location Not Specified"}</span>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Starts From</p>
                                        <p className="text-lg font-black text-slate-900">
                                            {formatPrice(project.price_range_min)}
                                            <span className="text-xs ml-1 text-slate-500 font-bold">EGP</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <BadgeDollarSign className="h-3 w-3" />
                                            In Budget
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="p-5 pt-0 gap-3">
                                <Link href={`/crm/inventory/${project.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full h-9 text-xs font-black uppercase border-slate-200">
                                        View Project
                                        <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </Link>
                                <Button
                                    className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white shrink-0"
                                    onClick={() => handleWhatsApp(project)}
                                    title="Send suggestion via WhatsApp"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Match Legend/Info */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                    <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">How Matching Works</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Our engine analyzes projects where the **starting price** fits the lead&apos;s budget.
                        A <span className="text-emerald-700 font-bold">100% Match</span> means the budget covers the maximum expected price in that development,
                        while a <span className="text-amber-700 font-bold">Potential Match</span> suggests the budget covers the entry-level options.
                    </p>
                </div>
            </div>
        </div>
    )
}
