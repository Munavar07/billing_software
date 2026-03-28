import { createClient } from '@/utils/supabase/server'

export interface Invoice {
    id: string
    invoice_number: string
    date: string
    client_name: string
    amount: number
    paid: number
    amount_due: number
    profit: number
    commission: number
    status: 'Paid' | 'Partial' | 'Unpaid'
    created_by: string
    hidden_remarks?: string
    is_deleted: boolean
    created_at: string
}

export async function getInvoices(includeDeleted = false): Promise<Invoice[]> {
    const supabase = await createClient()
    let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

    if (!includeDeleted) {
        query = query.eq('is_deleted', false)
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching invoices:', error)
        return []
    }
    return (data as Invoice[]) || []
}

export async function getInvoice(id: string): Promise<Invoice | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) return null
    return data as Invoice
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'created_at' | 'is_deleted'>): Promise<Invoice> {
    const supabase = await createClient()
    const id = crypto.randomUUID()

    const newInvoice = {
        ...data,
        id,
        is_deleted: false,
    }

    const { data: inserted, error } = await supabase
        .from('invoices')
        .insert(newInvoice)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return inserted as Invoice
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error || !data) return null
    return data as Invoice
}

export async function deleteInvoice(id: string): Promise<boolean> {
    const updated = await updateInvoice(id, { is_deleted: true })
    return updated !== null
}
