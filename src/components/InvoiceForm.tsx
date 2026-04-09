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
    const [newClientEmail, setNewClientEmail] = useState('')
    const [clientInputValue, setClientInputValue] = useState('')

    const isNewClient = (clientInputValue && !knownClients.includes(clientInputValue)) || (formData.client_name && !knownClients.includes(formData.client_name))

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
            if (formData.client_name && !knownClients.includes(formData.client_name)) {
                await addClientAction(formData.client_name, newClientMobile, newClientEmail)
            }

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
        setClientInputValue(inputValue)
        const newOption = { label: inputValue, value: inputValue }
        setClientOptions(prev => [...prev, newOption])
        setFormData(prev => ({ ...prev, client_name: inputValue }))
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-100">
                <h2 className="text-3xl font-black tracking-tight text-zinc-950">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
                <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 flex items-center gap-2 transition-colors bg-[#FAFAFA] px-4 py-2 rounded-full border border-neutral-200">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Invoice Number <span className="text-rose-500">*</span></label>
                    <input required type="text" name="invoice_number" value={formData.invoice_number} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none font-medium transition-all" placeholder="INV-001" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Date <span className="text-rose-500">*</span></label>
                    <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none font-medium transition-all" />
                </div>

                <div className="md:col-span-2 relative z-30">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Client Name <span className="text-rose-500">*</span></label>
                    <CreatableSelect
                        isClearable
                        isDisabled={loading}
                        isLoading={loading}
                        onChange={(newValue: any) => {
                            setFormData(prev => ({ ...prev, client_name: newValue?.value || '' }))
                            setClientInputValue(newValue?.value || '')
                        }}
                        onCreateOption={handleClientCreate}
                        inputValue={clientInputValue}
                        onInputChange={(val, { action }) => {
                            if (action === 'input-change') setClientInputValue(val)
                        }}
                        options={clientOptions}
                        value={formData.client_name ? { label: formData.client_name, value: formData.client_name } : null}
                        isSearchable
                        placeholder="Search or type client name..."
                        styles={{
                            control: (base) => ({
                                ...base,
                                padding: '4px',
                                borderRadius: '9999px',
                                borderColor: '#e5e5e5',
                                '&:hover': { borderColor: '#09090b' },
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                zIndex: 30
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: '#09090b',
                                fontWeight: '500'
                            }),
                            input: (base) => ({
                                ...base,
                                color: '#09090b'
                            })
                        }}
                    />
                </div>

                {isNewClient && (
                    <div className="md:col-span-2 bg-[#FAFAFA] p-6 rounded-3xl border border-neutral-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">New Client Mobile <span className="text-neutral-300">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={newClientMobile}
                                    onChange={e => setNewClientMobile(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 font-medium transition-all bg-white shadow-sm"
                                    placeholder="e.g. +971 50 123 4567"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">New Client Email <span className="text-neutral-300">(Optional)</span></label>
                                <input
                                    type="email"
                                    value={newClientEmail}
                                    onChange={e => setNewClientEmail(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 font-medium transition-all bg-white shadow-sm"
                                    placeholder="client@example.com"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-4 font-bold italic tracking-wide">* This info will be automatically added to the clients directory.</p>
                    </div>
                )}

                <div className="md:col-span-2 bg-zinc-50 p-6 rounded-3xl border border-neutral-200 mb-2 relative z-20">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Link Predefined Service <span className="text-neutral-300">(Optional)</span></label>
                    <CreatableSelect
                        isClearable
                        isDisabled={loading}
                        isLoading={loading}
                        className="text-zinc-950 font-medium"
                        placeholder="Search predefined services..."
                        options={serviceOptions}
                        value={selectedServiceId ? serviceOptions.find(o => o.value === selectedServiceId) : null}
                        onChange={(option: any) => {
                            handleServiceSelect(option?.value || '')
                        }}
                        onCreateOption={handleServiceCreate}
                        styles={{
                            control: (base) => ({
                                ...base,
                                padding: '4px',
                                borderRadius: '9999px',
                                borderColor: '#e5e5e5',
                                backgroundColor: 'white',
                                '&:hover': { borderColor: '#09090b' },
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 50
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: '#09090b',
                                fontWeight: '500'
                            }),
                            input: (base) => ({
                                ...base,
                                color: '#09090b'
                            })
                        }}
                    />
                    <p className="text-[10px] text-zinc-500 mt-3 font-bold">Populates Amount, Govt Charge, and Service Charge automatically.</p>
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Govt Charge (AED)</label>
                    <input type="number" name="commission" value={formData.commission} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none transition-all font-medium" placeholder="0" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Service Charge (AED)</label>
                    <input type="number" name="profit" value={formData.profit} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none transition-all font-medium" placeholder="0" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Total Amount (AED)</label>
                    <input readOnly type="number" name="amount" value={formData.amount} className="w-full border border-neutral-200 rounded-full py-3 px-5 outline-none bg-[#FAFAFA] text-zinc-600 cursor-not-allowed font-black" placeholder="0" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Amount Paid (AED) <span className="text-rose-500">*</span></label>
                    <input required type="number" name="paid" value={formData.paid} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none transition-all font-medium" placeholder="0" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Amount Due (AED)</label>
                    <input readOnly type="number" name="amount_due" value={formData.amount_due} className="w-full border border-neutral-100 rounded-full py-3 px-5 outline-none bg-zinc-100 cursor-not-allowed font-black" />
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-neutral-200 rounded-full shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none appearance-none bg-white font-bold text-zinc-950">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Invoice Description (Shown on PDF)</label>
                    <textarea name="invoice_description" value={formData.invoice_description} onChange={handleChange} rows={2} className="w-full border border-neutral-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none font-medium transition-all resize-none" placeholder="Service description for the customer..." />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">Hidden Remarks <span className="bg-zinc-100 px-2 py-0.5 rounded-full text-[10px] text-zinc-500">Dashboard Only</span></label>
                    <textarea name="hidden_remarks" value={formData.hidden_remarks} onChange={handleChange} rows={2} className="w-full border border-neutral-200 bg-neutral-50 rounded-2xl shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 py-3 px-5 outline-none font-medium transition-all resize-none" placeholder="Internal notes not visible on PDF..." />
                </div>
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-black text-white bg-zinc-950 hover:bg-zinc-800 hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-950 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEdit ? 'Save Changes' : 'Create Invoice'}
                </button>
            </div>
        </form>
    )
}
