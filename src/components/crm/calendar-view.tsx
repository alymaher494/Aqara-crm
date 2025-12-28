'use client'

import React, { useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Video, Phone, Flag, Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from '@/components/ui/badge'

interface Task {
    id: string
    title: string
    due_date: string
    type: string
    lead?: { id: string, name: string }
}

interface CalendarViewProps {
    tasks: Task[]
}

export function CalendarView({ tasks }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'meeting':
                return { color: 'bg-blue-500', icon: Video, label: 'Meeting' }
            case 'call':
                return { color: 'bg-green-500', icon: Phone, label: 'Call' }
            case 'deadline':
                return { color: 'bg-red-500', icon: Flag, label: 'Deadline' }
            case 'viewing':
                return { color: 'bg-purple-500', icon: MapPin, label: 'Viewing' }
            default:
                return { color: 'bg-slate-500', icon: CalendarIcon, label: 'Task' }
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full min-h-[700px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase tabular-nums">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="rounded-xl px-4 font-bold text-xs uppercase tracking-wider">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-4 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1">
                {calendarDays.map((day, idx) => {
                    const dayTasks = tasks.filter((task) => isSameDay(parseISO(task.due_date), day))
                    const isOutsideMonth = !isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-slate-50 transition-colors relative group",
                                isOutsideMonth ? "bg-slate-50/20" : "bg-white",
                                (idx + 1) % 7 === 0 && "border-r-0"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black tabular-nums transition-all",
                                    isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                                        isOutsideMonth ? "text-slate-300" : "text-slate-600 group-hover:bg-slate-100"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {dayTasks.slice(0, 3).map((task) => {
                                    const { color, icon: Icon } = getTypeStyles(task.type)
                                    return (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02]",
                                                color
                                            )}
                                        >
                                            <Icon className="h-2.5 w-2.5 shrink-0" />
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    )
                                })}
                                {dayTasks.length > 3 && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="w-full py-1 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-tight text-center">
                                                + {dayTasks.length - 3} more
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-4 rounded-3xl shadow-2xl border-white/20 bg-white/90 backdrop-blur-xl">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    Tasks for {format(day, 'MMM do')}
                                                </h4>
                                                <div className="space-y-2">
                                                    {dayTasks.map((task) => {
                                                        const { color, icon: Icon, label } = getTypeStyles(task.type)
                                                        return (
                                                            <div key={task.id} className="flex flex-col gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                                                <div className="flex items-center justify-between">
                                                                    <Badge className={cn("text-[9px] uppercase font-black px-1.5 py-0 h-4 border-none", color)}>
                                                                        {label}
                                                                    </Badge>
                                                                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                                        {format(parseISO(task.due_date), 'p')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                                                    {task.title}
                                                                </p>
                                                                {task.lead && (
                                                                    <p className="text-[9px] font-medium text-slate-500">
                                                                        Lead: {task.lead.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
