"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { updateCompanySettings, addNewTeamMember } from "@/app/(dashboard)/crm/settings/actions"
import { Loader2, Building2, User, Link2, MapPin, Users, Plus, ShieldAlert } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>
})

const companyFormSchema = z.object({
    name: z.string().min(2, {
        message: "Company name must be at least 2 characters.",
    }),
    work_start_time: z.string(),
    work_end_time: z.string(),
    work_days: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one work day.",
    }),
    office_lat: z.number().optional(),
    office_lng: z.number().optional(),
    allowed_radius: z.number().min(10).max(5000),
})

const days = [
    { id: "Sun", label: "Sunday" },
    { id: "Mon", label: "Monday" },
    { id: "Tue", label: "Tuesday" },
    { id: "Wed", label: "Wednesday" },
    { id: "Thu", label: "Thursday" },
    { id: "Fri", label: "Friday" },
    { id: "Sat", label: "Saturday" },
]

interface SettingsPageProps {
    organization: any
    team?: any[]
}

export default function SettingsPage({ organization, team = [] }: SettingsPageProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteName, setInviteName] = useState("")
    const [isInviting, setIsInviting] = useState(false)

    const form = useForm<z.infer<typeof companyFormSchema>>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: organization?.name || "",
            work_start_time: organization?.work_start_time || "09:00",
            work_end_time: organization?.work_end_time || "17:00",
            work_days: organization?.work_days || ["Sun", "Mon", "Tue", "Wed", "Thu"],
            office_lat: organization?.office_lat || 0,
            office_lng: organization?.office_lng || 0,
            allowed_radius: organization?.allowed_radius || 100,
        },
    })

    const officeLocation = {
        lat: form.watch('office_lat') || 0,
        lng: form.watch('office_lng') || 0
    }
    const currentRadius = form.watch('allowed_radius')

    // Limits
    const maxUsers = organization?.max_users || 5
    const currentUsers = team.length
    const usagePercent = (currentUsers / maxUsers) * 100

    async function onSubmit(values: z.infer<typeof companyFormSchema>) {
        setIsSaving(true)
        try {
            const result = await updateCompanySettings(values)
            if (result.success) {
                toast.success("Company settings updated successfully")
            } else {
                toast.error(result.error || "Failed to update settings")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    async function handleInvite() {
        if (!inviteEmail || !inviteName) {
            toast.error("Please fill in all fields")
            return
        }
        setIsInviting(true)
        const res = await addNewTeamMember({ email: inviteEmail, fullName: inviteName, role: 'agent' })

        if (res.error) {
            toast.error(res.error) // This will show the Limit Reached error
        } else {
            toast.success(res.message || "Invitation sent successfully")
            setIsInviteOpen(false)
            setInviteEmail("")
            setInviteName("")
        }
        setIsInviting(false)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Company Profile
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Office Location
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Team Members
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> My Profile
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" /> Integrations
                    </TabsTrigger>
                </TabsList>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <TabsContent value="company" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Profile</CardTitle>
                                    <CardDescription>
                                        Manage your organization details and work hours.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Acme Inc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="work_start_time"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Work Start Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="work_end_time"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Work End Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="work_days"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Work Days</FormLabel>
                                                    <FormDescription>
                                                        Select the days your team works.
                                                    </FormDescription>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {days.map((day) => (
                                                        <FormField
                                                            key={day.id}
                                                            control={form.control}
                                                            name="work_days"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={day.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, day.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== day.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            {day.label}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="location" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Geofence Settings</CardTitle>
                                    <CardDescription>
                                        Set your office location and allowed attendance radius.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="h-[400px] w-full border rounded-md overflow-hidden relative z-0">
                                        <LocationPickerMap
                                            position={officeLocation}
                                            radius={currentRadius}
                                            onPositionChange={(lat, lng) => {
                                                form.setValue('office_lat', lat)
                                                form.setValue('office_lng', lng)
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <FormLabel>Allowed Radius (meters)</FormLabel>
                                            <span className="text-sm font-medium text-muted-foreground">{currentRadius}m</span>
                                        </div>
                                        <Slider
                                            value={[currentRadius]}
                                            min={10}
                                            max={1000}
                                            step={10}
                                            onValueChange={(val) => form.setValue('allowed_radius', val[0])}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Employees must be within this circle to check in.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Latitude</Label>
                                            <Input readOnly value={officeLocation.lat.toFixed(6)} className="bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Longitude</Label>
                                            <Input readOnly value={officeLocation.lng.toFixed(6)} className="bg-muted" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>

                <TabsContent value="team">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>Manage users who have access to this workspace.</CardDescription>
                            </div>
                            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" /> Add Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Team Member</DialogTitle>
                                        <DialogDescription>
                                            Enter the details of the new user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Full Name</Label>
                                            <Input placeholder="Jane Doe" value={inviteName} onChange={e => setInviteName(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input placeholder="jane@example.com" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleInvite} disabled={isInviting}>
                                            {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Send Invitation
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Plan Usage</span>
                                    <span className={usagePercent >= 100 ? "text-red-500 font-bold" : ""}>
                                        {currentUsers} / {maxUsers} Users
                                    </span>
                                </div>
                                <Progress value={usagePercent} className={usagePercent >= 100 ? "bg-red-100 [&>div]:bg-red-500" : ""} />
                                {usagePercent >= 100 && (
                                    <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                        <ShieldAlert className="h-4 w-4 mr-2" />
                                        <span>Plan limit reached. Upgrade to add more users.</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {team.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email || "No email"}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground capitalize">
                                            {member.role || "Agent"}
                                        </div>
                                    </div>
                                ))}
                                {team.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No team members found.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>
                                Manage your personal account settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input placeholder="John Doe" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input placeholder="john@example.com" disabled />
                            </div>
                            <p className="text-sm text-muted-foreground">Profile editing is coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integrations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integrations</CardTitle>
                            <CardDescription>
                                Manage your external service connections.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">WhatsApp (Evolution API)</p>
                                    <p className="text-sm text-muted-foreground">
                                        Connect your WhatsApp number for campaigns.
                                    </p>
                                </div>
                                <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled>
                                    Connected
                                </Button>
                            </div>
                            <Separator />
                            <p className="text-sm text-muted-foreground">More integrations coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function Label({ children, className, ...props }: any) {
    return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>
}
