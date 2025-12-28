'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { launchCampaign } from './actions'
import { toast } from 'sonner'
import { Search, Send, Users, Loader2, CheckCircle2, XCircle, Phone } from 'lucide-react'

interface Lead {
    id: string
    name: string
    phone: string
    status: string
    source: string | null
    created_at: string
}

interface CampaignComposerProps {
    leads: Lead[]
}

export function CampaignComposer({ leads }: CampaignComposerProps) {
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
    const [message, setMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

    // Filter leads by search
    const filteredLeads = useMemo(() => {
        if (!searchQuery.trim()) return leads
        const query = searchQuery.toLowerCase()
        return leads.filter(
            (lead) =>
                lead.name?.toLowerCase().includes(query) ||
                lead.phone?.toLowerCase().includes(query) ||
                lead.source?.toLowerCase().includes(query)
        )
    }, [leads, searchQuery])

    // Toggle lead selection
    const toggleLead = (leadId: string) => {
        setSelectedLeadIds((prev) =>
            prev.includes(leadId)
                ? prev.filter((id) => id !== leadId)
                : [...prev, leadId]
        )
    }

    // Select all visible leads
    const selectAll = () => {
        const allVisibleIds = filteredLeads.map((l) => l.id)
        setSelectedLeadIds((prev) => {
            const newSelection = new Set([...prev, ...allVisibleIds])
            return Array.from(newSelection)
        })
    }

    // Deselect all
    const deselectAll = () => {
        setSelectedLeadIds([])
    }

    // Send campaign
    async function handleSend() {
        if (selectedLeadIds.length === 0) {
            toast.error('Please select at least one lead')
            return
        }
        if (!message.trim()) {
            toast.error('Please enter a message')
            return
        }

        setIsSending(true)
        setResult(null)

        try {
            const response = await launchCampaign(selectedLeadIds, message)

            if (response.error) {
                toast.error(response.error)
            } else {
                setResult({ sent: response.sent, failed: response.failed })
                toast.success(`Campaign sent! ${response.sent} messages delivered`)

                // Clear selection after successful send
                setSelectedLeadIds([])
                setMessage('')
            }
        } catch (error) {
            toast.error('Failed to launch campaign')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Lead Selector */}
            <Card className="lg:row-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Select Leads
                            </CardTitle>
                            <CardDescription>
                                Choose recipients for your campaign
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {selectedLeadIds.length} selected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search leads by name, phone, source..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Select All / Deselect All */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            Select All ({filteredLeads.length})
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                            Deselect All
                        </Button>
                    </div>

                    {/* Lead List */}
                    <ScrollArea className="h-[400px] rounded-lg border">
                        <div className="p-2 space-y-1">
                            {filteredLeads.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No leads found
                                </div>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        onClick={() => toggleLead(lead.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedLeadIds.includes(lead.id)
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedLeadIds.includes(lead.id)}
                                            onCheckedChange={() => toggleLead(lead.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{lead.name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {lead.phone}
                                            </p>
                                        </div>
                                        {lead.source && (
                                            <Badge variant="outline" className="text-xs">
                                                {lead.source}
                                            </Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Right: Message Composer */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Compose Message
                    </CardTitle>
                    <CardDescription>
                        Write your WhatsApp message. Use {'{name}'} to personalize.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder={`Hello {name}!\n\nWe have an exciting offer for you...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={8}
                        className="resize-none"
                    />

                    <div className="text-sm text-muted-foreground">
                        <p><strong>Variables:</strong></p>
                        <p className="text-xs">{'{name}'} - Lead's name</p>
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isSending || selectedLeadIds.length === 0 || !message.trim()}
                        className="w-full"
                        size="lg"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send to {selectedLeadIds.length} Leads
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Result Card */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-lg font-bold">{result.sent}</span>
                                <span className="text-sm">Sent</span>
                            </div>
                            {result.failed > 0 && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-5 w-5" />
                                    <span className="text-lg font-bold">{result.failed}</span>
                                    <span className="text-sm">Failed</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
