'use client'

import React, { useState, useMemo } from 'react'
import { TrendingUp, Wallet, ShieldCheck, Activity, Calendar, ArrowRight, DollarSign } from 'lucide-react'
import { Invoice } from '@/lib/fs-db'
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, subDays } from 'date-fns'

interface Props {
    initialInvoices: Invoice[]
}

export default function ProfitPage({ initialInvoices }: Props) {
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

    // Lifetime stats (always from all invoices)
    const lifetimeStats = useMemo(() => {
        let totalRevenue = 0
        let totalProfit = 0
        initialInvoices.forEach(inv => {
            totalRevenue += inv.amount
            totalProfit += inv.profit
        })
        return { totalRevenue, totalProfit }
    }, [initialInvoices])

    // Filtered stats
    const filteredInvoices = useMemo(() => {
        return initialInvoices.filter(inv => {
            const invDate = parseISO(inv.date)
            return isWithinInterval(invDate, {
                start: parseISO(startDate),
                end: parseISO(endDate)
            })
        })
    }, [initialInvoices, startDate, endDate])

    const stats = useMemo(() => {
        let revenue = 0
        let paid = 0
        let govt = 0
        let profit = 0
        let due = 0

        filteredInvoices.forEach(inv => {
            revenue += inv.amount
            paid += inv.paid
            govt += inv.commission
            profit += inv.profit
            due += Math.max(0, inv.amount - inv.paid)
        })

        return { revenue, paid, govt, profit, due }
    }, [filteredInvoices])

    return (
        <div className="space-y-6 text-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Profit & Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track your business performance and obligations.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-8 pr-2 py-1.5 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <ArrowRight className="h-3 w-3 text-gray-300" />
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-8 pr-2 py-1.5 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Lifetime Summary Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp className="h-32 w-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Lifetime Net Profit</div>
                        <div className="text-4xl font-black">AED {lifetimeStats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="h-10 w-px bg-slate-700 hidden md:block" />
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Lifetime Billed</div>
                        <div className="text-2xl font-bold">AED {lifetimeStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex-1 md:text-right">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                            <Activity className="h-3 w-3" /> All Time Stats
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtered Revenue</div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">AED {stats.revenue.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{filteredInvoices.length} invoices in range</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collected</div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">AED {stats.paid.toFixed(2)}</div>
                        <div className="text-[10px] text-red-500 mt-1 font-bold uppercase">AED {stats.due.toFixed(2)} OUTSTANDING</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm bg-green-50/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wider">Range Profit</div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-green-700 font-mono">AED {stats.profit.toFixed(2)}</div>
                        <div className="text-[10px] text-green-600 mt-1 font-bold uppercase">Your earnings this period</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Govt Charges</div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">AED {stats.govt.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold">External Obligations</div>
                    </div>
                </div>
            </div>

            {filteredInvoices.length === 0 && (
                <div className="mt-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                    <Calendar className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 uppercase tracking-widest text-xs">No data for this range</h3>
                    <p className="mt-1 text-sm">Try selecting a wider date interval to see analytics.</p>
                </div>
            )}
        </div>
    )
}
