'use client'

import React, { useState } from 'react'
import { Service } from '@/lib/fs-db'
import { PlusCircle, Trash2, Briefcase, Loader2, Edit2, X, Check } from 'lucide-react'
import { addService, deleteService, updateService } from '@/app/dashboard/services/actions'
import { toast } from 'sonner'

export default function ServiceManager({ initialServices }: { initialServices: Service[] }) {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [isAdding, setIsAdding] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [totalAmount, setTotalAmount] = useState<number | ''>('')
    const [govtCharge, setGovtCharge] = useState<number | ''>('')
    const [serviceCharge, setServiceCharge] = useState<number | ''>('')
    const [editingId, setEditingId] = useState<string | null>(null)

    const handleGovtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0
        setGovtCharge(val)
        if (typeof serviceCharge === 'number') {
            setTotalAmount(val + serviceCharge)
        }
    }

    const handleServiceChange = (val: number) => {
        setServiceCharge(val)
        if (typeof govtCharge === 'number') {
            setTotalAmount(val + govtCharge)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || totalAmount === '' || govtCharge === '' || serviceCharge === '') return

        setIsLoading(true)
        try {
            if (editingId) {
                await updateService(editingId, {
                    name,
                    total_amount: totalAmount as number,
                    govt_charge: govtCharge as number,
                    service_charge: serviceCharge as number
                })
                setServices(services.map(s => s.id === editingId ? {
                    ...s,
                    name,
                    total_amount: totalAmount as number,
                    govt_charge: govtCharge as number,
                    service_charge: serviceCharge as number
                } : s))
                setEditingId(null)
                toast.success('Service updated successfully')
            } else {
                const newService = await addService({
                    name,
                    total_amount: totalAmount as number,
                    govt_charge: govtCharge as number,
                    service_charge: serviceCharge as number
                })
                setServices([newService, ...services])
                toast.success('Service added successfully')
            }

            setName('')
            setTotalAmount('')
            setGovtCharge('')
            setServiceCharge('')
            setIsAdding(false)
        } catch (error) {
            toast.error(editingId ? 'Failed to update service' : 'Failed to add service')
        }
        setIsLoading(false)
    }

    const handleEdit = (service: Service) => {
        setName(service.name)
        setGovtCharge(service.govt_charge)
        setServiceCharge(service.service_charge)
        setTotalAmount(service.total_amount)
        setEditingId(service.id)
        setIsAdding(true)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setName('')
        setTotalAmount('')
        setGovtCharge('')
        setServiceCharge('')
        setIsAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return
        const res = await deleteService(id)
        if (res?.error) {
            toast.error(res.error)
        } else {
            setServices(services.filter(s => s.id !== id))
            toast.success('Service deleted')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Services</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your predefined services and pricing.</p>
                </div>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Service
                    </button>
                ) : (
                    <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm ring-4 ring-blue-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {editingId ? <Edit2 className="h-5 w-5 text-blue-500" /> : <PlusCircle className="h-5 w-5 text-blue-500" />}
                        {editingId ? 'Edit Service' : 'Add New Service'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Visa Processing"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Govt Charge (AED)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={govtCharge}
                                    onChange={handleGovtChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (AED)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={serviceCharge}
                                    onChange={e => handleServiceChange(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (AED)</label>
                                <input
                                    type="number"
                                    required
                                    readOnly
                                    min="0"
                                    step="0.01"
                                    value={totalAmount}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none bg-gray-100 cursor-not-allowed"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? <Check className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                                {editingId ? 'Update Service' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Service Name</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Total (AED)</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Govt Charge</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Svc Charge</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                                        {service.total_amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {service.govt_charge.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">
                                        {service.service_charge.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-md transition-colors" title="Edit">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p>No predefined services added yet.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
