import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageCircle, UserPlus, CheckCircle2 } from "lucide-react"

interface StatsCardsProps {
    callsCount: number
    whatsappCount: number
    newLeadsCount: number
    tasksDoneCount: number
}

export function StatsCards({
    callsCount,
    whatsappCount,
    newLeadsCount,
    tasksDoneCount
}: StatsCardsProps) {
    const stats = [
        {
            title: "Calls Made",
            value: callsCount,
            icon: Phone,
            color: "text-blue-500",
            borderColor: "border-l-blue-500",
            bgColor: "bg-blue-50/50"
        },
        {
            title: "WhatsApp",
            value: whatsappCount,
            icon: MessageCircle,
            color: "text-green-500",
            borderColor: "border-l-green-500",
            bgColor: "bg-green-50/50"
        },
        {
            title: "New Leads",
            value: newLeadsCount,
            icon: UserPlus,
            color: "text-purple-500",
            borderColor: "border-l-purple-500",
            bgColor: "bg-purple-50/50"
        },
        {
            title: "Tasks Done",
            value: tasksDoneCount,
            icon: CheckCircle2,
            color: "text-amber-500",
            borderColor: "border-l-amber-500",
            bgColor: "bg-amber-50/50"
        }
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className={`border-l-4 ${stat.borderColor} shadow-sm transition-all hover:shadow-md`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
