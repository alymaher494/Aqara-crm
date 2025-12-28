import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RecentLeadsProps {
    leads: {
        id: string
        name: string
        phone: string
        status: string
        created_at: string
    }[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
    if (leads.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent leads found.</div>
    }

    return (
        <div className="space-y-8">
            {leads.map((lead) => (
                <Link
                    href={`/crm/leads/${lead.id}`}
                    key={lead.id}
                    className="flex items-center group hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2"
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>{lead.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="capitalize">
                            {lead.status}
                        </Badge>
                    </div>
                </Link>
            ))}
        </div>
    )
}
