import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { Clock, Calendar, TrendingUp, Users } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"

export default async function AttendancePage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-8">Please log in.</div>
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return <div className="p-8">No organization found.</div>
    }

    // Fetch attendance logs for this month
    const startDate = startOfMonth(new Date()).toISOString()
    const endDate = endOfMonth(new Date()).toISOString()

    const { data: logs } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in', startDate)
        .lte('check_in', endDate)
        .order('check_in', { ascending: false })

    const totalDays = logs?.length || 0
    const completeDays = logs?.filter(l => l.check_out).length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                <p className="text-muted-foreground">Track your check-ins and work hours</p>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Check In/Out Widget */}
                <div className="lg:col-span-2">
                    <AttendanceWidget />
                </div>

                {/* Right: Statistics */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Days Checked In</span>
                                </div>
                                <span className="font-bold">{totalDays}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Complete Days</span>
                                </div>
                                <span className="font-bold">{completeDays}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm">Completion Rate</span>
                                </div>
                                <span className="font-bold">
                                    {totalDays > 0 ? Math.round((completeDays / totalDays) * 100) : 0}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {logs && logs.length > 0 ? (
                                <div className="space-y-3">
                                    {logs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {format(new Date(log.check_in), 'MMM d')}
                                            </span>
                                            <div className="flex gap-2">
                                                <span className="text-green-600">
                                                    {format(new Date(log.check_in), 'HH:mm')}
                                                </span>
                                                {log.check_out && (
                                                    <>
                                                        <span>→</span>
                                                        <span className="text-red-600">
                                                            {format(new Date(log.check_out), 'HH:mm')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No attendance records this month
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
