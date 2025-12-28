"use client"

import { Task } from "@/types"
import { TaskItem } from "./task-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck } from "lucide-react"

interface LeadTasksWidgetProps {
    tasks: Task[]
}

export function LeadTasksWidget({ tasks }: LeadTasksWidgetProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Tasks & Follow-ups</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks scheduled for this lead.</p>
                ) : (
                    tasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))
                )}
            </CardContent>
        </Card>
    )
}
