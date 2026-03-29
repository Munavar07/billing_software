import { getInvoices } from '@/lib/fs-db'
import Link from 'next/link'
import { Users, FileText, ArrowRight, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const invoices = await getInvoices()

    // Group invoices by client
    const clientsMap = new Map<string, {
        name: string,
        invoiceCount: number,
        totalBilled: number,
        totalPaid: number,
        totalDue: number,
        totalProfit: number
    }>()

    invoices.forEach(inv => {
        if (!inv.client_name) return

        const existing = clientsMap.get(inv.client_name) || {
            name: inv.client_name,
            invoiceCount: 0,
            totalBilled: 0,
            totalPaid: 0,
            totalDue: 0,
            totalProfit: 0
        }

        existing.invoiceCount += 1
        existing.totalBilled += inv.amount
        existing.totalPaid += inv.paid
        existing.totalDue += inv.amount_due

        // Only count profit if it's paid or partial? Actually, count total generated profit.
        existing.totalProfit += inv.profit

        clientsMap.set(inv.client_name, existing)
    })

    const clients = Array.from(clientsMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Clients Hub</h2>
                    <p className="text-sm text-gray-500 mt-1">View metrics and specific invoices for your clients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <div key={client.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={client.name}>{client.name}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <div className="text-gray-500 mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Invoices</div>
                                        <div className="font-semibold text-gray-900">{client.invoiceCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Profit</div>
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
                            <Link href={`/dashboard/clients/${encodeURIComponent(client.name)}`} className="bg-gray-50 border-t border-gray-100 p-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                View Invoices <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Clients Found</h3>
                        <p className="text-gray-500 mt-1">Create your first invoice to automatically register a client.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
