'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Invoice, Service } from '@/lib/fs-db'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
    initialData?: Invoice
    isEdit?: boolean
    knownClients?: string[]
    nextInvoiceNumber?: string
    services?: Service[]
}

export default function InvoiceForm({ initialData, isEdit, knownClients = [], nextInvoiceNumber = '', services = [] }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        invoice_number: initialData?.invoice_number || nextInvoiceNumber,
        date: initialData?.date || new Date().toISOString().split('T')[0],
        client_name: initialData?.client_name || '',
        amount: initialData?.amount || 0,
        paid: initialData?.paid || 0,
        amount_due: initialData?.amount_due || 0,
        profit: initialData?.profit || 0,
        commission: initialData?.commission || 0,
        status: initialData?.status || 'Unpaid',
        hidden_remarks: initialData?.hidden_remarks || ''
    })

    const [selectedServiceId, setSelectedServiceId] = useState('')

    useEffect(() => {
        const due = formData.amount - formData.paid
        const newDue = due < 0 ? 0 : due

        let newStatus = formData.status
        if (formData.amount > 0) {
            if (formData.paid >= formData.amount) newStatus = 'Paid'
            else if (formData.paid > 0) newStatus = 'Partial'
            else newStatus = 'Unpaid'
        }

        setFormData(prev => ({
            ...prev,
            amount_due: newDue,
            status: newStatus as any
        }))
    }, [formData.amount, formData.paid])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = isEdit ? `/api/invoices/${initialData?.id}` : `/api/invoices`
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to save')

            toast.success(isEdit ? 'Invoice updated!' : 'Invoice created!')
            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            toast.error('Failed to save invoice')
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }))
    }

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        setSelectedServiceId(id)
        if (!id) return

        const service = services.find(s => s.id === id)
        if (service) {
            setFormData(prev => ({
                ...prev,
                amount: service.total_amount,
                commission: service.govt_charge,
                profit: service.service_charge,
                hidden_remarks: prev.hidden_remarks ? prev.hidden_remarks : service.name
            }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to list
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Invoice Number <span className="text-red-500">*</span></label>
                    <input required type="text" name="invoice_number" value={formData.invoice_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="INV-001" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" />
                </div>

                <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                    <input list="knownClientsList" required type="text" name="client_name" value={formData.client_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="John Doe" autoComplete="off" />
                    <datalist id="knownClientsList">
                        {knownClients.map(client => (
                            <option key={client} value={client} />
                        ))}
                    </datalist>
                </div>

                {services.length > 0 && (
                    <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
                        <label className="block text-sm font-medium text-blue-900 mb-1">Populate from Predefined Service (Optional)</label>
                        <select
                            value={selectedServiceId}
                            onChange={handleServiceSelect}
                            className="w-full border border-blue-200 bg-white rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none text-blue-800"
                        >
                            <option value="">-- Choose a service --</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (${s.total_amount})</option>
                            ))}
                        </select>
                        <p className="text-xs text-blue-600 mt-1.5">Selecting a service will automatically fill the Total Amount, Govt Charge, and Service Charge.</p>
                    </div>
                )}

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Total Amount ($) <span className="text-red-500">*</span></label>
                    <input required type="number" min="0" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Amount Paid ($) <span className="text-red-500">*</span></label>
                    <input required type="number" min="0" step="0.01" name="paid" value={formData.paid} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Amount Due ($)</label>
                    <input disabled type="number" value={formData.amount_due} className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg shadow-sm py-2.5 px-3 outline-none cursor-not-allowed" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none">
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Service Charge ($)</label>
                    <input type="number" min="0" step="0.01" name="profit" value={formData.profit} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Govt Charge ($)</label>
                    <input type="number" min="0" step="0.01" name="commission" value={formData.commission} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" />
                </div>

                <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="hidden_remarks" value={formData.hidden_remarks} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="Description of services..." />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEdit ? 'Save Changes' : 'Create Invoice'}
                </button>
            </div>
        </form>
    )
}
