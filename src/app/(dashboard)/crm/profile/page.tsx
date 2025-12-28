'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Mail, Building, Shield, Save, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile, updateProfile } from './actions'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await getProfile()
            if (error) {
                toast.error(error)
            } else {
                setProfile(data)
                setFormData({
                    full_name: data.full_name || '',
                    phone_number: data.phone_number || ''
                })
            }
            setIsLoading(false)
        }
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const res = await updateProfile(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Profile updated successfully')
            setProfile({ ...profile, ...formData })
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your account information and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="mx-auto h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl mb-4">
                            <User className="h-12 w-12 text-slate-400" />
                        </div>
                        <CardTitle>{profile?.full_name || 'User Name'}</CardTitle>
                        <CardDescription>{profile?.email}</CardDescription>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Badge variant="outline" className="capitalize">
                                <Shield className="h-3 w-3 mr-1" />
                                {profile?.role}
                            </Badge>
                            {profile?.is_super_admin && (
                                <Badge className="bg-amber-500 text-white">
                                    Super Admin
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm">
                            <Building className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">
                                {profile?.organizations?.name || 'No Organization'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 truncate">{profile?.email}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        className="pl-10"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        placeholder="Enter your phone"
                                        className="pl-10"
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 pt-2">
                                <Button type="submit" className="w-fit" disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your authentication and security settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                            <div className="space-y-1">
                                <p className="font-bold text-sm">Account Password</p>
                                <p className="text-xs text-muted-foreground">Change your password to keep your account secure.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.info('Password change is handled via email.')}>
                                <Lock className="h-3 w-3 mr-2" />
                                Request Change
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
