"use client"

import { Task } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { toggleTaskCompletion, deleteTask } from "@/app/(dashboard)/crm/tasks/actions"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { isPast, differenceInHours } from "date-fns"


interface TaskItemProps {
    task: Task
}

export function TaskItem({ task }: TaskItemProps) {
    const [isCompleted, setIsCompleted] = useState(task.is_completed)
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleToggle(checked: boolean) {
        setIsCompleted(checked)
        try {
            await toggleTaskCompletion(task.id, checked)
            toast.success(checked ? "Task completed" : "Task pending")
        } catch (error) {
            setIsCompleted(!checked) // Revert
            toast.error("Failed to update")
        }
    }

    async function handleDelete() {
        if (!confirm("Delete this task?")) return
        setIsDeleting(true)
        try {
            await deleteTask(task.id)
            toast.success("Task deleted")
        } catch (error) {
            setIsDeleting(false)
            toast.error("Failed to delete")
        }
    }

    if (isDeleting) return null

    const dueDate = new Date(task.due_date)
    const isOverdue = !isCompleted && isPast(dueDate)
    const isUpcoming = !isCompleted && !isOverdue && differenceInHours(dueDate, new Date()) <= 24

    return (
        <div className={`flex items-center justify-between p-4 border rounded-lg transition-all ${isCompleted ? 'opacity-50 bg-card' :
            isOverdue ? 'bg-red-50 border-red-200 shadow-sm' :
                isUpcoming ? 'bg-amber-50 border-amber-200 shadow-sm' :
                    'bg-card'
            }`}>

            <div className="flex items-center gap-4">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggle}
                    className="h-5 w-5"
                />
                <div>
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                        {isOverdue && <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0 h-4">Overdue</Badge>}
                        {isUpcoming && <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] px-1.5 py-0 h-4">Upcoming</Badge>}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.due_date), "PPP p")}
                        </span>
                        {task.lead && (
                            <Link href={`/crm/leads/${task.lead.id}`} className="flex items-center gap-1 hover:text-primary hover:underline">
                                <User className="h-3 w-3" />
                                {task.lead.name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
