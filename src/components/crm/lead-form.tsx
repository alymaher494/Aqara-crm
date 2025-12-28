'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createLead, getTeamMembers } from '@/app/(dashboard)/crm/leads/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { User, UserX } from 'lucide-react'

// Special constant for "unassigned" - SelectItem cannot have empty string value
const UNASSIGNED_VALUE = '__unassigned__'

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    notes: z.string().optional(),
    assigned_to: z.string().optional(),
})

interface TeamMember {
    id: string
    full_name: string | null
    email: string | null
}

export function LeadForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

    // Fetch team members on mount
    useEffect(() => {
        async function fetchTeamMembers() {
            const members = await getTeamMembers()
            // Filter out any members with invalid IDs
            const validMembers = members.filter(
                (m): m is TeamMember => Boolean(m && m.id && m.id.trim() !== '')
            )
            setTeamMembers(validMembers)
        }
        fetchTeamMembers()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            notes: '',
            assigned_to: UNASSIGNED_VALUE, // Use special value instead of empty string
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('name', values.name)
        formData.append('phone', values.phone)
        if (values.notes) formData.append('notes', values.notes)

        // Convert special unassigned value back to empty for DB
        const assignedTo = values.assigned_to === UNASSIGNED_VALUE ? '' : values.assigned_to
        if (assignedTo) formData.append('assigned_to', assignedTo)

        try {
            const result = await createLead(null, formData)

            if (result?.message === 'success') {
                toast.success('Lead created successfully')
                form.reset()
                if (onSuccess) {
                    onSuccess()
                }
            } else if (result?.errors) {
                if (result.errors.phone) {
                    form.setError('phone', { message: result.errors.phone[0] })
                }
                if (result.errors.name) {
                    form.setError('name', { message: result.errors.name[0] })
                }
                if (result.message) toast.error(result.message)
            } else if (result?.message) {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <input type="hidden" name="phone" value={form.getValues("phone")} />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <PhoneInput
                                    placeholder="Enter phone number"
                                    defaultCountry="EG"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Assign Agent Dropdown */}
                <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign to Agent</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || UNASSIGNED_VALUE}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team member...">
                                            {field.value && field.value !== UNASSIGNED_VALUE ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {teamMembers.find(m => m.id === field.value)?.full_name || 'Selected'}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <UserX className="h-4 w-4" />
                                                    Unassigned
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {/* Unassigned option with non-empty special value */}
                                    <SelectItem value={UNASSIGNED_VALUE}>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <UserX className="h-4 w-4" />
                                            Unassigned
                                        </div>
                                    </SelectItem>
                                    {/* Only render team members with valid IDs */}
                                    {teamMembers.map((member) => (
                                        <SelectItem
                                            key={member.id}
                                            value={member.id}
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {member.full_name || member.email || 'Unknown'}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any notes here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Lead'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
