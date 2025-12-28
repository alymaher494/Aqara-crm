'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Megaphone, Users, MessageSquare, Rocket, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { createCampaign, getLeadsCount } from "@/lib/actions"
import { toast } from "sonner"

export default function CreateCampaignPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [reach, setReach] = useState(0)

    const [form, setForm] = useState({
        name: "",
        message: "",
        filters: {
            status: "all"
        }
    })

    // Fetch reach whenever filters change
    useEffect(() => {
        const fetchReach = async () => {
            const count = await getLeadsCount(form.filters)
            setReach(count)
        }
        fetchReach()
    }, [form.filters])

    const handleCreate = async () => {
        if (!form.name || !form.message) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        const res = await createCampaign(form)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Campaign launched and queued!")
            router.push("/crm/campaigns")
        }
        setLoading(false)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create <span className="text-primary">Marketing Campaign</span></h1>
                <p className="text-slate-500 font-medium">Follow the steps to reach out to your prospects via WhatsApp.</p>
            </div>

            {/* Steps Progress */}
            <div className="flex items-center justify-between px-4 max-w-md mx-auto md:mx-0">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 3 && <div className={`h-1 w-12 mx-2 rounded ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Audience */}
            {step === 1 && (
                <Card className="p-8 space-y-6 border-none shadow-xl rounded-3xl">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Step 1: Choose Your Audience</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="campaign-name" className="font-bold text-slate-700">Campaign Name</Label>
                            <Input
                                id="campaign-name"
                                placeholder="e.g., New Year's Special Offer"
                                className="h-12 rounded-xl"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="font-bold text-slate-700">Filter Leads by Status</Label>
                            <Select
                                value={form.filters.status}
                                onValueChange={(v) => setForm({ ...form, filters: { ...form.filters, status: v } })}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Leads</SelectItem>
                                    <SelectItem value="new">New Leads</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="meeting">Meeting Scheduled</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-blue-900 font-bold">Estimated Reach</p>
                                <p className="text-blue-700/70 text-sm font-medium">Number of leads matching current filters.</p>
                            </div>
                            <div className="text-3xl font-black text-blue-600">
                                {reach}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full h-12 rounded-xl font-bold text-lg"
                            disabled={!form.name}
                            onClick={() => setStep(2)}
                        >
                            Continue to Message
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 2: Message Content */}
            {step === 2 && (
                <Card className="p-8 space-y-6 border-none shadow-xl rounded-3xl">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Step 2: Compose Message</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="message" className="font-bold text-slate-700">WhatsApp Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                className="min-h-[200px] rounded-xl p-4 resize-none leading-relaxed"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                            <p className="text-slate-400 text-xs font-medium">Tip: Keep it personal and concise for better engagement.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1 font-bold">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button
                            className="h-12 rounded-xl flex-[2] font-bold text-lg"
                            disabled={!form.message}
                            onClick={() => setStep(3)}
                        >
                            Final Review
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Launch */}
            {step === 3 && (
                <Card className="p-8 space-y-6 border-none shadow-xl rounded-3xl text-center">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <Rocket className="h-10 w-10 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900">Ready to Launch!</h2>
                        <p className="text-slate-500 font-medium">Please review the details before starting the campaign.</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border border-slate-100">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Campaign Name</span>
                            <span className="font-bold text-slate-900">{form.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Target Reach</span>
                            <span className="font-bold text-blue-600">{reach} Leads</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Message Preview</span>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 italic text-sm">
                                "{form.message}"
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" onClick={() => setStep(2)} className="h-14 rounded-xl flex-1 font-bold">
                            Edit Message
                        </Button>
                        <Button
                            className="h-14 rounded-xl flex-[2] font-black text-xl shadow-2xl shadow-primary/30"
                            disabled={loading}
                            onClick={handleCreate}
                        >
                            {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Rocket className="mr-2 h-6 w-6" /> FIRE CAMPAIGN</>}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
