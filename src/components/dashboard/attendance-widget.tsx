'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { checkIn, checkOut, getAttendanceStatus } from '@/app/(dashboard)/crm/attendance/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AttendanceWidget({ compact }: { compact?: boolean }) {
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [status, setStatus] = useState<any>(null) // { log, orgSettings }
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [distance, setDistance] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchStatus = async () => {
        setLoading(true)
        const res = await getAttendanceStatus()
        if (res.error) {
            console.error(res.error)
        } else {
            setStatus(res)
        }
        setLoading(false)
    }

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setLocation({ lat: latitude, lng: longitude })
                setError(null)

                // Calculate client-side distance for specific UI feedback
                if (status?.orgSettings?.office_lat) {
                    const d = getDistanceFromLatLonInM(
                        latitude,
                        longitude,
                        status.orgSettings.office_lat,
                        status.orgSettings.office_lng
                    )
                    setDistance(d)
                }
            },
            (err) => {
                setError('Unable to retrieve your location')
                console.error(err)
            }
        )
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    useEffect(() => {
        // Once we have org settings, try to get location
        if (status) {
            getLocation()
        }
    }, [status])

    const handleCheckIn = async () => {
        if (!location) {
            toast.error("Waiting for location...")
            getLocation()
            return
        }
        setActionLoading(true)
        try {
            const res = await checkIn(location.lat, location.lng)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Checked in successfully!")
                fetchStatus()
            }
        } catch (e) {
            toast.error("Something went wrong")
        }
        setActionLoading(false)
    }

    const handleCheckOut = async () => {
        if (!location) {
            // Fallback if location lost, usually checkout is less strict, but let's try get it
            getLocation()
        }
        // Proceed even if location is slightly stale or just fallback to 0,0 if strictness allows
        // For now, let's require it to match the action signature
        const lat = location?.lat || 0
        const lng = location?.lng || 0

        setActionLoading(true)
        try {
            const res = await checkOut(lat, lng)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Checked out successfully!")
                fetchStatus()
            }
        } catch (e) {
            toast.error("Something went wrong")
        }
        setActionLoading(false)
    }

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Syncing...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const log = status?.log
    const org = status?.orgSettings
    const isCheckedIn = !!log?.check_in_time
    const isCheckedOut = !!log?.check_out_time

    if (compact) {
        return (
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border shadow-sm ring-1 ring-slate-100">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-slate-700">
                    {isCheckedIn ? (isCheckedOut ? "Shift Done" : format(new Date(log.check_in_time), 'hh:mm a')) : "Not In"}
                </span>
                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider ${isCheckedIn && !isCheckedOut ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500'}`}>
                    {isCheckedIn ? (isCheckedOut ? "Ended" : "Active") : "Off"}
                </Badge>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Daily Attendance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isCheckedOut ? (
                        <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="w-fit bg-green-100 text-green-800">Completed</Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                                In: {format(new Date(log.check_in_time), 'hh:mm a')}<br />
                                Out: {format(new Date(log.check_out_time), 'hh:mm a')}
                            </p>
                        </div>
                    ) : isCheckedIn ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{format(new Date(log.check_in_time), 'hh:mm a')}</span>
                                <Badge className="bg-green-500">Active</Badge>
                            </div>
                            <Button
                                onClick={handleCheckOut}
                                disabled={actionLoading}
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Check Out
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {location ? (
                                    distance !== null ? (
                                        <span className={distance > (org?.allowed_radius || 100) ? "text-red-500 font-medium" : "text-green-600"}>
                                            {Math.round(distance)}m from office
                                        </span>
                                    ) : (
                                        <span>Locating office...</span>
                                    )
                                ) : (
                                    <span>{error || "Locating you..."}</span>
                                )}
                            </div>

                            {org?.office_lat && distance !== null && distance > (org.allowed_radius || 100) && (
                                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
                                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                    You are outside the allowed zone ({org.allowed_radius}m).
                                </div>
                            )}

                            <Button
                                onClick={handleCheckIn}
                                disabled={actionLoading || !location || (distance !== null && org?.office_lat && distance > (org.allowed_radius || 100))}
                                className="w-full"
                            >
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Check In
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
