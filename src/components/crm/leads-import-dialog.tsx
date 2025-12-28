'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { importLeadsFromExcel } from '@/app/(dashboard)/crm/leads/actions'
import { toast } from 'sonner'

export function LeadsImportDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<any[] | null>(null)
    const [result, setResult] = useState<{ imported: number; total: number; errors: string[] } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onload = (event) => {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)
                setPreview(data.slice(0, 5)) // Show first 5 rows
            }
            reader.readAsBinaryString(selectedFile)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const rows = XLSX.utils.sheet_to_json(ws)

                const res = await importLeadsFromExcel(rows as any[])
                if ('error' in res) {
                    toast.error(res.error as string)
                } else {
                    setResult(res as any)
                    toast.success(`Successfully imported ${res.imported} leads!`)
                }
                setLoading(false)
            }
            reader.readAsBinaryString(file)
        } catch (error) {
            console.error('Import error:', error)
            toast.error('Failed to process Excel file')
            setLoading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v)
            if (!v) reset()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileUp className="h-4 w-4" /> Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Smart Excel Import</DialogTitle>
                    <DialogDescription>
                        Import leads from Excel/CSV. Ensure columns match our template.
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Input
                                id="excel-file"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </div>

                        {preview && preview.length > 0 && (
                            <div className="rounded-md border p-4 bg-slate-50">
                                <h4 className="text-sm font-medium mb-2">Preview (First 5 Rows):</h4>
                                <div className="max-h-[150px] overflow-auto text-xs">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                {Object.keys(preview[0]).map((h) => (
                                                    <th key={h} className="p-1 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, i) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    {Object.values(row).map((v: any, j) => (
                                                        <td key={j} className="p-1">{String(v)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="flex items-center gap-3 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            <div className="font-medium">Import Complete</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">Imported</div>
                                <div className="text-2xl font-bold">{result.imported}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500">Total Rows</div>
                                <div className="text-2xl font-bold">{result.total}</div>
                            </div>
                        </div>
                        {result.errors.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Issues encountered ({result.errors.length})</span>
                                </div>
                                <div className="max-h-[100px] overflow-auto p-2 bg-amber-50 rounded border border-amber-100 text-xs text-amber-800">
                                    {result.errors.map((err, i) => (
                                        <div key={i}>{err}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!result ? (
                        <Button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                'Confirm Import'
                            )}
                        </Button>
                    ) : (
                        <Button onClick={() => setOpen(false)} className="w-full">
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
