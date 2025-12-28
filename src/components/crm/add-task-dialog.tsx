"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { createTask } from "@/app/(dashboard)/crm/tasks/actions"
import { Lead } from "@/types"

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    due_date: z.string().min(1, 'Date is required'),
    lead_id: z.string().optional(),
})

interface AddTaskDialogProps {
    leads?: { id: string, name: string }[]
}

export function AddTaskDialog({ leads = [] }: AddTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            due_date: '',
            lead_id: 'none',
        },
    })

    async function onSubmit(values: z.infer<typeof taskSchema>) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('due_date', values.due_date)
        if (values.lead_id) formData.append('lead_id', values.lead_id)

        try {
            const result = await createTask(null, formData)
            if (result?.message === 'success') {
                toast.success('Task created')
                setOpen(false)
                form.reset()
            } else {
                toast.error(result?.message || 'Failed')
            }
        } catch (error) {
            toast.error('Error creating task')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Follow up call" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date & Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lead_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Related Lead</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select lead (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">No Lead Linked</SelectItem>
                                            {leads.map((lead) => (
                                                <SelectItem key={lead.id} value={lead.id}>
                                                    {lead.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
