'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addNote } from '@/app/(dashboard)/crm/leads/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NotesSection({ leadId, initialNotes }: { leadId: string, initialNotes: string | null }) {
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleAddNote() {
        if (!note.trim()) return

        setIsSubmitting(true)
        try {
            await addNote(leadId, note)
            toast.success('Note added')
            setNote('')
            router.refresh()
        } catch (error) {
            toast.error('Failed to add note')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-4 bg-muted/50 min-h-[200px] whitespace-pre-wrap text-sm">
                {initialNotes || 'No notes yet.'}
            </div>
            <div className="space-y-2">
                <Textarea
                    placeholder="Type your note here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Note'}
                </Button>
            </div>
        </div>
    )
}
