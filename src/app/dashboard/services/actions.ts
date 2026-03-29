'use server'

import { createService, updateService, deleteService } from '@/lib/fs-db'
import { revalidatePath } from 'next/cache'

export async function addServiceAction(formData: FormData) {
    const name = formData.get('name') as string
    const total_amount = Number(formData.get('total_amount'))
    const govt_charge = Number(formData.get('govt_charge'))
    const service_charge = Number(formData.get('service_charge'))

    if (!name || isNaN(total_amount)) {
        return { error: 'Invalid input' }
    }

    try {
        await createService({
            name,
            total_amount,
            govt_charge,
            service_charge
        })
        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/create')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function deleteServiceAction(id: string) {
    try {
        await deleteService(id)
        revalidatePath('/dashboard/services')
        revalidatePath('/dashboard/create')
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}
