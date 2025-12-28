'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, Shield, Save, Loader2 } from "lucide-react"
import { updateLeadComments } from "@/app/(dashboard)/crm/leads/actions"
import { toast } from "sonner"

interface LeadInsightsProps {
    leadId: string
    initialClientComment: string
    initialSalesComment: string
}

export function LeadInsights({ leadId, initialClientComment, initialSalesComment }: LeadInsightsProps) {
    const [clientComment, setClientComment] = useState(initialClientComment || "")
    const [salesComment, setSalesComment] = useState(initialSalesComment || "")
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        setIsSaving(true)
        try {
            await updateLeadComments(leadId, {
                client_comment: clientComment,
                sales_comment: salesComment
            })
            toast.success("Insights saved successfully")
        } catch (error) {
            toast.error("Failed to save insights")
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Client Inquiry
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="What is the client looking for?"
                        className="min-h-[150px] text-sm resize-none"
                        value={clientComment || ''}
                        onChange={(e) => setClientComment(e.target.value)}
                        onBlur={handleSave}
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                        Auto-saves when you click away
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        Sales Note (Internal)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Internal notes, strategy, and feedback..."
                        className="min-h-[150px] text-sm resize-none"
                        value={salesComment || ''}
                        onChange={(e) => setSalesComment(e.target.value)}
                        onBlur={handleSave}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-[10px] text-muted-foreground italic">
                            Auto-saves when you click away
                        </p>
                        <Button
                            size="sm"
                            className="h-8 gap-2"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Save className="h-3 w-3" />
                            )}
                            Save Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
