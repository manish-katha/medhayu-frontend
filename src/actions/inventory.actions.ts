
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addInventoryItem, updateInventoryItem as updateItemInService, deleteInventoryItem as deleteItemFromService } from '@/services/inventory.service';
import { inventoryItemSchema } from '@/types/inventory';
import { InventoryItem } from '@/types/inventory';

export async function createOrUpdateInventoryItem(prevState: any, formData: FormData) {
    const data = JSON.parse(formData.get('jsonData') as string);
    const validatedFields = inventoryItemSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation failed.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        let savedItem: InventoryItem | null = null;
        if (data.id) {
            // This is an update
            savedItem = await updateItemInService(data.id, validatedFields.data);
            if (!savedItem) {
                return { error: 'Item not found for update.' };
            }
        } else {
            // This is a new item creation
            savedItem = await addInventoryItem(validatedFields.data as Omit<InventoryItem, 'id'>);
        }
        
        revalidatePath('/erp/inventory');
        revalidatePath(`/erp/inventory/${savedItem.id}`);
        return { success: true, data: savedItem };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await deleteItemFromService(id);
        revalidatePath('/erp/inventory');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Failed to delete item.' };
    }
}

export async function updateItemReorderPoint(id: string, newThreshold: number): Promise<{ success: boolean, error?: string }> {
  try {
    await updateItemInService(id, { lowStockThreshold: newThreshold });
    revalidatePath(`/erp/inventory/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update reorder point:', error);
    return { success: false, error: 'Failed to update reorder point.' };
  }
}
