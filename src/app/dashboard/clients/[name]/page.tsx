import InvoiceTable from '@/components/InvoiceTable'
import { getInvoices } from '@/lib/fs-db'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientDetailsPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params
    const decodedName = decodeURIComponent(name)

    // Fetch all invoices and filter for this client exactly
    // In a real huge app we'd do a supabase .eq('client_name', decodedName)
    // but we can reuse the generic getInvoices for now since it's a small app.
    const allInvoices = await getInvoices()
    const clientInvoices = allInvoices.filter(inv => inv.client_name === decodedName)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/dashboard/clients" className="hover:text-blue-600 transition-colors">Clients</Link>
                        <span>/</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        {decodedName}
                    </h2>
                </div>
                <Link href="/dashboard/clients" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
            </div>

            <InvoiceTable initialInvoices={clientInvoices} />
        </div>
    )
}
