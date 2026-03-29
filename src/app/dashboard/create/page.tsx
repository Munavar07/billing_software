import InvoiceForm from '@/components/InvoiceForm'
import { getInvoices, getServices } from '@/lib/fs-db'

export default async function CreateInvoicePage() {
    const invoices = await getInvoices()
    const services = await getServices()
    const uniqueClients = Array.from(new Set(invoices.map((i: any) => i.client_name).filter(Boolean)))

    let maxNumber = 0
    let prefix = 'INV/nat/'

    invoices.forEach((inv: any) => {
        const match = inv.invoice_number.match(/^(.+?)(\d+)$/)
        if (match) {
            prefix = match[1]
            const num = parseInt(match[2], 10)
            if (num > maxNumber) maxNumber = num
        } else {
            const numMatch = inv.invoice_number.match(/\d+/)
            if (numMatch) {
                const num = parseInt(numMatch[0], 10)
                if (num > maxNumber) maxNumber = num
            }
        }
    })

    // Fallback to INV/nat/1000 if no existing numbered invoices are found
    const nextInvoiceNumber = maxNumber > 0 ? `${prefix}${maxNumber + 1}` : `${prefix}1000`

    return (
        <div className="py-2">
            <InvoiceForm knownClients={uniqueClients as string[]} nextInvoiceNumber={nextInvoiceNumber} services={services} />
        </div>
    )
}
