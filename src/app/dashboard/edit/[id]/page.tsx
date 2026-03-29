import InvoiceForm from '@/components/InvoiceForm'
import { getInvoice, getServices } from '@/lib/fs-db'
import { notFound } from 'next/navigation'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invoice = await getInvoice(id)
    const services = await getServices()

    if (!invoice) {
        notFound()
    }

    return (
        <div className="py-2">
            <InvoiceForm initialData={invoice} isEdit services={services} />
        </div>
    )
}
