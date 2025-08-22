
import React from 'react';
import { getInventoryItems } from '@/services/inventory.service';
import InventoryClientPage from './InventoryClientPage';

export default async function InventoryPage() {
    // Fetch initial data on the server
    const inventoryData = await getInventoryItems();
    return <InventoryClientPage initialInventory={inventoryData} />;
}
