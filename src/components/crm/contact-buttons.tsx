'use client'

import { Button } from "@/components/ui/button"
import { Phone, MessageCircle } from "lucide-react"
import { logActivity } from "@/app/(dashboard)/crm/leads/actions"
import { toast } from "sonner"

interface ContactButtonsProps {
    leadId: string
    phone: string
}

export function ContactButtons({ leadId, phone }: ContactButtonsProps) {
    const handleContactClick = async (type: string) => {
        try {
            await logActivity(leadId, type, `Clicked ${type === 'call_attempt' ? 'phone' : 'WhatsApp'}`)
            toast.success(type === 'call_attempt' ? "Call logged" : "WhatsApp open logged")
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleContactClick('whatsapp_opened')}
            >
                <Button className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
            </a>
            <a
                href={`tel:${phone}`}
                onClick={() => handleContactClick('call_attempt')}
            >
                <Button variant="outline">
                    <Phone className="mr-2 h-4 w-4" /> Call
                </Button>
            </a>
        </>
    )
}
