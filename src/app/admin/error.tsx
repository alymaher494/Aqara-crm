'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error('Admin Panel Error:', error)
    }, [error])

    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
            <div className="flex flex-col items-center space-y-2 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
                <p className="text-muted-foreground">
                    The Admin Panel encountered an unexpected error.
                </p>
                <div className="text-sm bg-slate-100 p-2 rounded text-red-600 font-mono">
                    {error.message || "Unknown Error"}
                </div>
            </div>
            <div className="flex space-x-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => router.push('/crm')}>
                    Return to Dashboard
                </Button>
            </div>
        </div>
    )
}
