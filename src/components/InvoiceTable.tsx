'use client'

import React, { useState, useMemo } from 'react'
import { Invoice } from '@/lib/fs-db'
import { Search, Filter, Download, MoreVertical, Edit2, Trash2, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    initialInvoices: Invoice[]
}

const statusStyles = {
    Paid: 'bg-green-100 text-green-700 border-green-200',
    'Partially Paid': 'bg-blue-100 text-blue-700 border-blue-200',
    Unpaid: 'bg-red-100 text-red-700 border-red-200',
} as const

const statusDotStyles = {
    Paid: 'bg-green-500',
    'Partially Paid': 'bg-blue-500',
    Unpaid: 'bg-red-500',
} as const

export default function InvoiceTable({ initialInvoices }: Props) {
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [showDeleted, setShowDeleted] = useState(false)
    const [showOverdue, setShowOverdue] = useState(false)
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')

    const handleSoftDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            setInvoices(invoices.map(inv => inv.id === id ? { ...inv, is_deleted: true } : inv))
            toast.success('Invoice deleted successfully')
        } catch (e) {
            toast.error('Failed to delete invoice')
        }
    }

    const handleDownloadPdf = async (id: string, number: string) => {
        try {
            toast.loading('Generating PDF...', { id: 'pdf' })
            const res = await fetch(`/api/invoices/${id}/pdf`)
            if (!res.ok) throw new Error('Failed to generate PDF')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Invoice-${number}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)

            toast.success('PDF Downloaded', { id: 'pdf' })
        } catch (e) {
            toast.error('Failed to download PDF', { id: 'pdf' })
        }
    }

    const filteredInvoices = useMemo(() => {
        let result = invoices

        if (!showDeleted) {
            result = result.filter(inv => !inv.is_deleted)
        }

        if (showOverdue) {
            const today = startOfDay(new Date())
            result = result.filter(inv => {
                const invDate = parseISO(inv.date)
                return inv.amount_due > 0 && isBefore(invDate, today)
            })
        }

        if (statusFilter !== 'All') {
            result = result.filter(inv => inv.status === statusFilter)
        }

        if (dateStart) {
            result = result.filter(inv => inv.date >= dateStart)
        }

        if (dateEnd) {
            result = result.filter(inv => inv.date <= dateEnd)
        }

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(inv =>
                inv.invoice_number.toLowerCase().includes(q) ||
                inv.client_name.toLowerCase().includes(q)
            )
        }

        return result
    }, [invoices, search, statusFilter, showDeleted, showOverdue, dateStart, dateEnd])

    return (
        <div className="bg-white border text-sm border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by invoice # or client..."
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none border py-2"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            title="Status filter"
                            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 outline-none border px-3"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>

                        <input
                            type="date"
                            title="Start Date"
                            className="border-gray-300 rounded-lg shadow-sm py-2 px-3 border outline-none"
                            value={dateStart}
                            onChange={e => setDateStart(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            title="End Date"
                            className="border-gray-300 rounded-lg shadow-sm py-2 px-3 border outline-none"
                            value={dateEnd}
                            onChange={e => setDateEnd(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            checked={showDeleted}
                            onChange={e => setShowDeleted(e.target.checked)}
                        />
                        <span className="text-gray-700">Show Deleted</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                            checked={showOverdue}
                            onChange={e => setShowOverdue(e.target.checked)}
                        />
                        <span className="text-gray-700 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-red-500" />
                            Overdue Only
                        </span>
                    </label>
                </div>
            </div>

            {/* ── MOBILE CARD VIEW (visible on small screens) ── */}
            <div className="md:hidden divide-y divide-gray-100">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                        <div key={inv.id} className={`p-4 hover:bg-gray-50 transition-colors ${inv.is_deleted ? 'opacity-50' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 text-sm">{inv.invoice_number}</span>
                                        {inv.is_deleted && <span className="text-xs text-red-500 font-medium">Deleted</span>}
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusStyles[inv.status as keyof typeof statusStyles]}`}>{inv.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium mt-0.5 truncate">{inv.client_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{format(parseISO(inv.date), 'MMM d, yyyy')}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-gray-900">AED {inv.amount.toFixed(2)}</div>
                                    <div className="text-xs text-green-600">Paid: AED {inv.paid.toFixed(2)}</div>
                                    <div className={`text-xs font-medium ${inv.amount_due > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                        Due: AED {inv.amount_due.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Svc: AED {inv.profit.toFixed(2)} · Govt: AED {inv.commission.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)} className="text-blue-600 hover:text-blue-800 p-1" title="Download PDF">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <Link href={`/dashboard/edit/${inv.id}`} className="text-gray-500 hover:text-gray-800 p-1" title="Edit">
                                        <Edit2 className="h-4 w-4" />
                                    </Link>
                                    {!inv.is_deleted && (
                                        <button onClick={() => handleSoftDelete(inv.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-500">
                        <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm">No invoices found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* ── DESKTOP TABLE VIEW (hidden on small screens) ── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice / Date</th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                            <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Service/Govt Charge</th>
                            <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((inv) => (
                                <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${inv.is_deleted ? 'opacity-50' : ''}`}>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{inv.invoice_number}</span>
                                            <span className="text-xs text-gray-500">{format(parseISO(inv.date), 'MMM d, yyyy')}</span>
                                            {inv.is_deleted && <span className="text-xs text-red-500 font-medium">Deleted</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="text-gray-900 font-medium">{inv.client_name}</div>
                                        <div className="text-xs text-gray-500" title={inv.hidden_remarks}>
                                            {inv.hidden_remarks ? 'Has remarks' : ''}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusStyles[inv.status as keyof typeof statusStyles]}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <div className="text-gray-900 font-medium">AED {inv.amount.toFixed(2)}</div>
                                        <div className="text-xs text-green-600">Paid: AED {inv.paid.toFixed(2)}</div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <span className={`font-medium ${inv.amount_due > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            AED {inv.amount_due.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <div className="text-gray-900">Service Charge: AED {inv.profit.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">Govt Charge: AED {inv.commission.toFixed(2)}</div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)} className="text-blue-600 hover:text-blue-900" title="Download PDF">
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <Link href={`/dashboard/edit/${inv.id}`} className="text-gray-500 hover:text-gray-900" title="Edit">
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                            {!inv.is_deleted && (
                                                <button onClick={() => handleSoftDelete(inv.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                                    <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                    <p>No invoices found matching your filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

