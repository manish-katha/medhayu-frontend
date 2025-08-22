
import React from 'react';
import { getProducts } from '@/services/product.service';
import MarketplaceClientPage from './MarketplaceClientPage';

export default async function MarketplacePage() {
  const allProducts = await getProducts();
  
  return <MarketplaceClientPage allProducts={allProducts} />;
}
