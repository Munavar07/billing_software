'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Invoice, Service } from '@/lib/fs-db'
import { toast } from 'sonner'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { addClientAction } from '@/app/dashboard/clients/actions'
import { addService } from '@/app/dashboard/services/actions'
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
    const [clientOptions, setClientOptions] = useState(
        knownClients.map(c => ({ value: c, label: c }))
    )
    const [serviceOptions, setServiceOptions] = useState(
        services.map(s => ({
            value: s.id,
            label: `${s.name} (AED ${s.total_amount})`,
            service: s
        }))
    )

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
        hidden_remarks: initialData?.hidden_remarks || '',
        invoice_description: initialData?.invoice_description || ''
    })

    const [selectedServiceId, setSelectedServiceId] = useState('')
    const [newClientMobile, setNewClientMobile] = useState('')

    const isNewClient = formData.client_name && !knownClients.includes(formData.client_name)

    useEffect(() => {
        const due = formData.amount - formData.paid
        const newDue = due < 0 ? 0 : due

        let newStatus = formData.status
        if (formData.amount > 0) {
            if (formData.paid >= formData.amount) newStatus = 'Paid'
            else if (formData.paid > 0) newStatus = 'Partially Paid'
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

            const responseData = await res.json()

            if (!res.ok) {
                throw new Error(responseData.error || 'Failed to save')
            }

            toast.success(isEdit ? 'Invoice updated!' : 'Invoice created!')
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Save error:', error)
            toast.error(error.message || 'Failed to save invoice')
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        // Handle numeric fields
        if (['amount', 'paid', 'commission', 'profit'].includes(name)) {
            const val = parseFloat(value) || 0

            if (name === 'commission' || name === 'profit') {
                const commission = name === 'commission' ? val : (formData.commission as number)
                const profit = name === 'profit' ? val : (formData.profit as number)
                const total = commission + profit

                setFormData(prev => ({
                    ...prev,
                    [name]: val,
                    amount: total,
                    amount_due: Math.max(0, total - (prev.paid as number))
                }))
            } else if (name === 'paid') {
                setFormData(prev => ({
                    ...prev,
                    paid: val,
                    amount_due: Math.max(0, (prev.amount as number) - val)
                }))
            }
            return
        }

        // Handle string/enum fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleServiceSelect = (id: string) => {
        setSelectedServiceId(id)
        if (!id) return

        const service = serviceOptions.find(o => o.value === id)?.service
        if (service) {
            setFormData(prev => ({
                ...prev,
                amount: service.total_amount,
                commission: service.govt_charge,
                profit: service.service_charge,
                invoice_description: service.name
            }))
        }
    }

    const handleServiceCreate = async (inputValue: string) => {
        setLoading(true)
        try {
            const newService = await addService({
                name: inputValue,
                govt_charge: formData.commission,
                service_charge: formData.profit,
                total_amount: formData.amount
            })

            if (newService) {
                const newOption = {
                    value: newService.id,
                    label: `${newService.name} (AED ${newService.total_amount})`,
                    service: newService
                }
                setServiceOptions(prev => [...prev, newOption])
                setSelectedServiceId(newService.id)
                setFormData(prev => ({ ...prev, invoice_description: inputValue }))
                toast.success(`Service "${inputValue}" saved to predefined list.`)
            }
        } catch (e) {
            toast.error('Failed to save predefined service')
        }
        setLoading(false)
    }

    const handleClientCreate = async (inputValue: string) => {
        setLoading(true)
        const newOption = { label: inputValue, value: inputValue }
        setClientOptions(prev => [...prev, newOption])
        setFormData(prev => ({ ...prev, client_name: inputValue }))

        await addClientAction(inputValue, newClientMobile)
        setLoading(false)
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

                <div className="md:col-span-2 relative z-20">
                    <label className="block font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                    <CreatableSelect
                        isClearable
                        isDisabled={loading}
                        isLoading={loading}
                        onChange={(newValue: any) => setFormData(prev => ({ ...prev, client_name: newValue?.value || '' }))}
                        onCreateOption={handleClientCreate}
                        options={clientOptions}
                        value={formData.client_name ? { label: formData.client_name, value: formData.client_name } : null}
                        isSearchable
                        placeholder="Search or type client name..."
                        styles={{
                            control: (base) => ({
                                ...base,
                                padding: '2px',
                                borderRadius: '0.5rem',
                                borderColor: '#D1D5DB',
                                '&:hover': { borderColor: '#3B82F6' },
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            })
                        }}
                    />
                </div>

                {isNewClient && (
                    <div className="md:col-span-2 bg-blue-50/30 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">New Client Mobile (Optional)</label>
                        <input
                            type="text"
                            value={newClientMobile}
                            onChange={e => setNewClientMobile(e.target.value)}
                            className="w-full border border-blue-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all bg-white"
                            placeholder="e.g. +971 50 123 4567"
                        />
                        <p className="text-[10px] text-blue-500 mt-1.5 font-medium italic">* This number will be saved to the new client's profile.</p>
                    </div>
                )}

                <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
                    <label className="block text-sm font-medium text-blue-900 mb-1">Populate from Predefined Service (Optional)</label>
                    <CreatableSelect
                        isClearable
                        isDisabled={loading}
                        isLoading={loading}
                        className="text-blue-900"
                        placeholder="Search or type to create a new service..."
                        options={serviceOptions}
                        value={selectedServiceId ? serviceOptions.find(o => o.value === selectedServiceId) : null}
                        onChange={(option: any) => {
                            handleServiceSelect(option?.value || '')
                        }}
                        onCreateOption={handleServiceCreate}
                        styles={{
                            control: (base) => ({
                                ...base,
                                padding: '2px',
                                borderRadius: '0.5rem',
                                borderColor: '#BFDBFE',
                                backgroundColor: 'white',
                                '&:hover': { borderColor: '#3B82F6' },
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 50
                            })
                        }}
                    />
                    <p className="text-xs text-blue-600 mt-1.5">Selecting a service will automatically fill the Total Amount, Govt Charge, and Service Charge.</p>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Govt Charge (AED)</label>
                    <input type="number" name="commission" value={formData.commission} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="0" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Service Charge (AED)</label>
                    <input type="number" name="profit" value={formData.profit} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="0" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Total Amount (AED)</label>
                    <input readOnly type="number" name="amount" value={formData.amount} className="w-full border border-gray-200 rounded-lg shadow-sm py-2.5 px-3 outline-none bg-gray-100 cursor-not-allowed font-bold" placeholder="0" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Amount Paid (AED) <span className="text-red-500">*</span></label>
                    <input required type="number" name="paid" value={formData.paid} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="0" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Amount Due (AED)</label>
                    <input readOnly type="number" name="amount_due" value={formData.amount_due} className="w-full border border-gray-200 rounded-lg shadow-sm py-2.5 px-3 outline-none bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none appearance-none bg-white">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">Invoice Description (Shown on PDF)</label>
                    <textarea name="invoice_description" value={formData.invoice_description} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="Service description for the customer..." />
                </div>

                <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1 text-blue-600">Hidden Remarks (Dashboard Only)</label>
                    <textarea name="hidden_remarks" value={formData.hidden_remarks} onChange={handleChange} rows={2} className="w-full border border-blue-200 bg-blue-50/30 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 outline-none" placeholder="Internal notes not visible on PDF..." />
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
