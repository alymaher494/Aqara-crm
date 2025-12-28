'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateCSVReport } from '@/lib/reports-actions'
import { toast } from 'sonner'

interface ExportButtonProps {
    type: 'leads' | 'sales'
    filters?: any
}

export function ExportButton({ type, filters }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async () => {
        setIsLoading(true)
        try {
            const csv = await generateCSVReport(type, filters)
            if (!csv) {
                toast.error('No data to export')
                return
            }

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('Report downloaded successfully')
        } catch (error) {
            console.error('Export Error:', error)
            toast.error('Failed to export report')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={isLoading}
            variant="outline"
            className="rounded-xl font-bold text-xs uppercase tracking-widest px-4 h-10 border-slate-200 hover:bg-slate-50 transition-all"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4 text-blue-600" />
            )}
            Export CSV
        </Button>
    )
}
