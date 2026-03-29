'use client'

import React, { useState } from 'react'
import { PlusCircle, Users, FileText, TrendingUp, ArrowRight, Loader2, Search } from 'lucide-react'
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
    const [searchTerm, setSearchTerm] = useState('')
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

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-2">
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight text-white">Clients Hub</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your clients and view their specific metrics.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                        />
                    </div>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Client
                        </button>
                    )}
                </div>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-xl shadow-blue-50/50 ring-4 ring-blue-50/30 animate-in fade-in slide-in-from-top-4 duration-300 max-w-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">New Client Partner</h3>
                    </div>
                    <form onSubmit={handleAddClient} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client Full Name</label>
                            <input
                                type="text"
                                required
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                                placeholder="Enter legal client name..."
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Partner
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <div key={client.name} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col uppercase border-b-4 border-b-slate-50 hover:border-b-blue-500">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors" title={client.name}>{client.name}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">CLIENT PARTNER</span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                    <div>
                                        <div className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Invoices</div>
                                        <div className="font-black text-slate-900 text-base">{client.invoiceCount}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5 justify-end"><TrendingUp className="w-3 h-3 text-emerald-500" /> Revenue</div>
                                        <div className="font-black text-emerald-600 text-base">{client.totalProfit.toFixed(0)} <span className="text-[10px]">AED</span></div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-xs font-bold pt-1">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="tracking-tighter uppercase tracking-widest text-[9px]">Total Volume:</span>
                                        <span className="text-slate-700">AED {client.totalBilled.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 tracking-widest text-[9px]">Outstanding:</span>
                                        <span className={`${client.totalDue > 0 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100' : 'text-slate-900'}`}>
                                            AED {client.totalDue.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/clients/${encodeURIComponent(client.name)}`} className="bg-slate-50/80 p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white group-hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                Access Detailed Portal <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Expand Your Network</h3>
                        <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto">Start by adding your first client partner to track performance.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-6 font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto">
                            <PlusCircle className="w-5 h-5" /> Add Partner Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
