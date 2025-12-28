'use client'

import { useState, useEffect } from "react"
import { getWhatsAppStatus, initWhatsAppSession, disconnectWhatsApp } from "@/lib/whatsapp-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Smartphone,
    QrCode,
    RefreshCw,
    Unplug,
    CheckCircle2,
    AlertCircle,
    Clock,
    ShieldCheck,
    Info,
    Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function WhatsAppIntegrationPage() {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchStatus = async () => {
        const res = await getWhatsAppStatus()
        if (res.data) setStatus(res.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(() => {
            if (status?.status === 'init') fetchStatus()
        }, 5000)
        return () => clearInterval(interval)
    }, [status?.status])

    const handleStart = async () => {
        setActionLoading(true)
        const res = await initWhatsAppSession()
        if (res.error) toast.error(res.error)
        else {
            toast.success("Connection started. Please wait for QR code.")
            fetchStatus()
        }
        setActionLoading(false)
    }

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect WhatsApp? This will stop all active campaigns.")) return
        setActionLoading(true)
        const res = await disconnectWhatsApp()
        if (res.error) toast.error(res.error)
        else {
            toast.success("Device disconnected.")
            fetchStatus()
        }
        setActionLoading(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    const isConnected = status?.status === 'connected'
    const isInit = status?.status === 'init'
    const isDisconnected = !status || status.status === 'disconnected'

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        <Smartphone className="h-4 w-4" />
                        Integrations Module
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        WhatsApp <span className="text-green-600">Connectivity</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Manage your mobile device link to enable mass-marketing features.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <Card className="lg:col-span-2 p-8 rounded-[2rem] border-none shadow-xl bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Smartphone className="h-48 w-48 text-primary" />
                    </div>

                    <div className="relative space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-slate-800">Device Status</h2>
                                <p className="text-slate-500 text-sm font-medium">Current link between the CRM and your WhatsApp account.</p>
                            </div>
                            <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isConnected ? "bg-emerald-500 text-white" :
                                    isInit ? "bg-amber-100 text-amber-700 animate-pulse" :
                                        "bg-slate-100 text-slate-400"
                                }`}>
                                {status?.status || 'disconnected'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Visual Indicator */}
                            <div className={`rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed ${isConnected ? "bg-emerald-50 border-emerald-200" :
                                    isInit ? "bg-amber-50 border-amber-200" :
                                        "bg-slate-50 border-slate-200"
                                }`}>
                                {isConnected ? (
                                    <>
                                        <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-900 text-xl">{status.phone_number || "Active Device"}</p>
                                            <p className="text-emerald-700/70 text-sm font-bold">Successfully Bound</p>
                                        </div>
                                    </>
                                ) : isInit ? (
                                    <>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
                                            <QrCode className="h-24 w-24 text-slate-800" />
                                        </div>
                                        <p className="text-amber-800 font-bold text-sm">Waiting for Scan...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                                            <Unplug className="h-8 w-8" />
                                        </div>
                                        <p className="text-slate-400 font-bold">No Device Linked</p>
                                    </>
                                )}
                            </div>

                            {/* Info & Actions */}
                            <div className="space-y-6 flex flex-col justify-center">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Last Active: {status?.last_active ? new Date(status.last_active).toLocaleTimeString() : 'Never'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        Encrypted Session
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {isDisconnected ? (
                                        <Button
                                            onClick={handleStart}
                                            disabled={actionLoading}
                                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-black text-lg shadow-xl"
                                        >
                                            {actionLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "START NEW SESSION"}
                                        </Button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-14 rounded-2xl border-slate-200 font-bold"
                                                onClick={fetchStatus}
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Refresh
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                disabled={actionLoading}
                                                className="flex-1 h-14 rounded-2xl font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                                onClick={handleDisconnect}
                                            >
                                                <Unplug className="mr-2 h-4 w-4" />
                                                Disconnect
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-3xl border-none shadow-lg bg-emerald-600 text-white space-y-4">
                        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest opacity-80">
                            <Info className="h-4 w-4" />
                            How it works
                        </div>
                        <p className="font-medium text-emerald-50 leading-relaxed">
                            Once connected, the CRM will be able to send automated messages to your leads based on marketing campaigns.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                                Click Start Session
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                                Scan the QR Code
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                                Keep your phone online
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-3xl border-none shadow-lg bg-white space-y-4 border border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Session Logs
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between text-xs border-b border-slate-50 pb-2">
                                <span className="text-slate-500 font-medium">Session Initialized</span>
                                <span className="text-slate-400">Just now</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
