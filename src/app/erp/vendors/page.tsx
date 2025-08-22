
import React from 'react';
import { getVendors } from '@/services/vendor.service';
import VendorClientPage from './VendorClientPage';

export default async function VendorsPage() {
    const vendors = await getVendors();
    return <VendorClientPage initialVendors={vendors} />;
}
