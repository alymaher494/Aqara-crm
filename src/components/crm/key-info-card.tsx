'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Target, Loader2, Building, FileText } from "lucide-react"
import { updateLead } from "@/app/(dashboard)/crm/leads/actions"
import { toast } from "sonner"
import { Lead } from "@/types"

interface KeyInfoCardProps {
    lead: Lead
    noCardWrapper?: boolean
}

export function KeyInfoCard({ lead, noCardWrapper }: KeyInfoCardProps) {
    const [summary, setSummary] = useState(lead.summary || "")
    const [interestedIn, setInterestedIn] = useState(lead.interested_in || "")
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave(updates: Partial<Lead>) {
        setIsSaving(true)
        try {
            await updateLead(lead.id, updates)
            toast.success("Lead info updated")
        } catch (error) {
            toast.error("Failed to update lead info")
        } finally {
            setIsSaving(false)
        }
    }

    const content = (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    Interested Project
                </Label>
                <Input
                    id="project"
                    placeholder="e.g. Aqara Residence, Unit 402"
                    value={interestedIn || ''}
                    onChange={(e) => setInterestedIn(e.target.value)}
                    onBlur={() => {
                        if (interestedIn !== lead.interested_in) {
                            handleSave({ interested_in: interestedIn })
                        }
                    }}
                    className="text-sm bg-muted/30 border-slate-200 focus:bg-white transition-colors"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Lead Summary / Bio
                </Label>
                <Textarea
                    id="summary"
                    placeholder="Brief overview of the customer's background and needs..."
                    className="min-h-[120px] text-sm resize-none bg-muted/30 border-slate-200 focus:bg-white transition-colors"
                    value={summary || ''}
                    onChange={(e) => setSummary(e.target.value)}
                    onBlur={() => {
                        if (summary !== lead.summary) {
                            handleSave({ summary: summary })
                        }
                    }}
                />
            </div>

            {isSaving && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving changes...
                </div>
            )}
        </div>
    )

    if (noCardWrapper) return content

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Key Information
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {content}
            </CardContent>
        </Card>
    )
}
