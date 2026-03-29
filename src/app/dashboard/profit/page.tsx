import { getInvoices } from '@/lib/fs-db'
import { TrendingUp, DollarSign, Wallet, ShieldCheck, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfitPage() {
    // Only get invoices that are not deleted
    const invoices = await getInvoices(false)

    // Calculate aggregated stats
    let totalRevenue = 0 // Total amount billed
    let totalPaid = 0 // Total amount actually collected
    let totalGovtCharges = 0 // Total commissions 
    let totalProfit = 0 // Total service charge
    let outstandingBalance = 0

    // To show potential profit vs realized profit, we'll calculate everything.
    invoices.forEach(inv => {
        totalRevenue += inv.amount
        totalPaid += inv.paid
        outstandingBalance += Math.max(0, inv.amount - inv.paid)

        // Do we count profit on unpaid invoices? Yes, as "Expected Profit".
        // If we want purely realized profit, we'd scale it by (paid/amount) or just count fully paid.
        // We will just sum up the fields for total accounting transparency.
        totalGovtCharges += inv.commission
        totalProfit += inv.profit
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Business Profit & Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">High-level financial overview of your invoice data.</p>
                </div>
            </div>

            {/* Top Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-sm font-medium text-gray-500">Total Billed Volume</div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">AED {totalRevenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1">Across {invoices.length} invoices</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-sm font-medium text-gray-500">Actual Money Collected</div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">AED {totalPaid.toFixed(2)}</div>
                        <div className="text-sm text-red-500 mt-1 font-medium">AED {outstandingBalance.toFixed(2)} still outstanding</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md ring-1 ring-blue-50 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="text-sm font-bold tracking-wide text-blue-600 uppercase">Total Service Charge (Profit)</div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-gray-900">AED {totalProfit.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">Your business net generated</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-sm font-medium text-gray-500">Govt Charges Collected</div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">AED {totalGovtCharges.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1">Held for external obligations</div>
                    </div>
                </div>
            </div>

            {/* Charts / Details Area placeholder */}
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Analytics Data Populated</h3>
                <p>As you add more invoices, this dashboard will continue to track your real-time profit and obligations.</p>
            </div>
        </div>
    )
}

function BarChart3(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}
