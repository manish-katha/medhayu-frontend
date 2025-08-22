
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { InventoryItem } from '@/types/inventory';
import path from 'path';

const inventoryFilePath = path.join(corpusPath, 'inventory.json');

export async function getInventoryItems(): Promise<InventoryItem[]> {
    const items = await readJsonFile<InventoryItem[]>(inventoryFilePath, []);
    return items.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
}

export async function getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const items = await getInventoryItems();
    return items.find(item => item.id === id);
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const items = await getInventoryItems();
    const newItem: InventoryItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...itemData,
    };
    items.unshift(newItem); // Add to the top of the list
    await writeJsonFile(inventoryFilePath, items);
    return newItem;
}

export async function updateInventoryItem(id: string, dataToUpdate: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const items = await getInventoryItems();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
        return null;
    }

    const updatedItem = { ...items[index], ...dataToUpdate };
    items[index] = updatedItem;

    await writeJsonFile(inventoryFilePath, items);
    return updatedItem;
}

export async function deleteInventoryItem(id: string): Promise<void> {
    let items = await getInventoryItems();
    items = items.filter(item => item.id !== id);
    await writeJsonFile(inventoryFilePath, items);
}
