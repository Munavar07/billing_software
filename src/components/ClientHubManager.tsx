'use client'

import React, { useState } from 'react'
import { PlusCircle, Users, FileText, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { addClientAction } from '@/app/dashboard/clients/actions'
import { toast } from 'sonner'

interface ClientStats {
    name: string
    invoiceCount: number
    totalBilled: number
    totalPaid: number
    totalDue: number
    totalProfit: number
}

export default function ClientHubManager({ initialClients }: { initialClients: ClientStats[] }) {
    const [clients, setClients] = useState<ClientStats[]>(initialClients)
    const [isAdding, setIsAdding] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newName, setNewName] = useState('')

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setIsLoading(true)
        const res = await addClientAction(newName)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Client added successfully')
            // Add to list optimistically
            const newClient: ClientStats = {
                name: newName.trim(),
                invoiceCount: 0,
                totalBilled: 0,
                totalPaid: 0,
                totalDue: 0,
                totalProfit: 0
            }
            setClients([newClient, ...clients].sort((a, b) => a.name.localeCompare(b.name)))
            setNewName('')
            setIsAdding(false)
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Clients Hub</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your clients and view their specific metrics.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add New Client
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">New Client</h3>
                    <form onSubmit={handleAddClient} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                            <input
                                type="text"
                                required
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter client name..."
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Client
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <div key={client.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col uppercase">
                            <div className="p-5 flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={client.name}>{client.name}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Invoices</div>
                                        <div className="font-semibold text-gray-900">{client.invoiceCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Profit</div>
                                        <div className="font-semibold text-green-600">${client.totalProfit.toFixed(2)}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Billed:</span>
                                        <span className="font-medium text-gray-900">${client.totalBilled.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Amount Due:</span>
                                        <span className={`font-medium ${client.totalDue > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                            ${client.totalDue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/clients/${encodeURIComponent(client.name)}`} className="bg-gray-50 border-t border-gray-100 p-3 text-center text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                View Invoices <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Clients Found</h3>
                        <p className="text-gray-500 mt-1">Add your first client manually or create an invoice.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
