'use server'

import { createClientRecord } from '@/lib/fs-db'
import { revalidatePath } from 'next/cache'

export async function addClientAction(name: string) {
    if (!name || name.trim() === '') {
        return { error: 'Invalid name' }
    }

    try {
        const client = await createClientRecord(name.trim())
        if (!client) {
            return { error: 'Failed to create client or client already exists.' }
        }
        revalidatePath('/dashboard/clients')
        revalidatePath('/dashboard/create')
        return { success: true, client }
    } catch (e: any) {
        return { error: e.message }
    }
}
