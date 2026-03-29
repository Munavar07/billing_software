'use client'

import React, { useState } from 'react'
import { Service } from '@/lib/fs-db'
import { PlusCircle, Trash2, Briefcase } from 'lucide-react'
import { addServiceAction, deleteServiceAction } from '@/app/dashboard/services/actions'
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

    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        setTotalAmount(isNaN(val) ? '' : val)
    }

    const handleGovtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        setGovtCharge(isNaN(val) ? '' : val)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || totalAmount === '' || govtCharge === '' || serviceCharge === '') {
            toast.error('Please fill all fields')
            return
        }

        setIsLoading(true)
        const formData = new FormData()
        formData.append('name', name)
        formData.append('total_amount', totalAmount.toString())
        formData.append('govt_charge', govtCharge.toString())
        formData.append('service_charge', serviceCharge.toString())

        const res = await addServiceAction(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Service added successfully')
            setIsAdding(false)
            setName('')
            setTotalAmount('')
            setGovtCharge('')
            setServiceCharge('')
            // Optimistic update
            setServices([{
                id: crypto.randomUUID(),
                name,
                total_amount: totalAmount as number,
                govt_charge: govtCharge as number,
                service_charge: serviceCharge as number,
                created_at: new Date().toISOString()
            }, ...services])
        }
        setIsLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return
        const res = await deleteServiceAction(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            setServices(services.filter(s => s.id !== id))
            toast.success('Service deleted')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Services</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your predefined predefined services and pricing.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Service
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">New Service</h3>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-500">✕</button>
                    </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Govt Charge</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={serviceCharge}
                                    onChange={e => setServiceCharge(parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={totalAmount}
                                    onChange={handleTotalChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Saving...' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Govt Charge</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Charge</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${service.total_amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${service.govt_charge.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">${service.service_charge.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
