
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Vendor } from '@/types/vendor';
import path from 'path';

const vendorsFilePath = path.join(corpusPath, 'vendors.json');

export async function getVendors(): Promise<Vendor[]> {
    const vendors = await readJsonFile<Vendor[]>(vendorsFilePath, []);
    return vendors.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
}

export async function getVendorByName(name: string): Promise<Vendor | undefined> {
    const vendors = await getVendors();
    return vendors.find(v => v.name.toLowerCase() === name.toLowerCase());
}

export async function addVendor(vendorData: Omit<Vendor, 'id'>): Promise<Vendor> {
    const vendors = await getVendors();
    const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        ...vendorData,
    };
    vendors.push(newVendor);
    await writeJsonFile(vendorsFilePath, vendors);
    return newVendor;
}

export async function updateVendor(id: string, dataToUpdate: Partial<Vendor>): Promise<Vendor | null> {
    const vendors = await getVendors();
    const index = vendors.findIndex(v => v.id === id);

    if (index === -1) {
        return null;
    }
    
    const updatedVendor = { ...vendors[index], ...dataToUpdate };
    vendors[index] = updatedVendor;

    await writeJsonFile(vendorsFilePath, vendors);
    return updatedVendor;
}

export async function deleteVendor(id: string): Promise<void> {
    let vendors = await getVendors();
    vendors = vendors.filter(v => v.id !== id);
    await writeJsonFile(vendorsFilePath, vendors);
}
