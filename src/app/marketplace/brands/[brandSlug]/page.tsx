

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getBrandBySlug } from '@/services/brand.service';
import { getProductsByBrand } from '@/services/product.service';
import { BrandStorefront } from '@/components/MarketPlace/BrandStorefront';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BrandPageProps {
  params: { brandSlug: string };
}

export default async function BrandPage({ params: paramsProp }: BrandPageProps) {
  const params = use(paramsProp);
  const { brandSlug } = params;
  const brand = await getBrandBySlug(brandSlug);
  
  if (!brand) {
    notFound();
  }
  
  const products = await getProductsByBrand(brand.name);

  return (
    <div className="space-y-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/marketplace">Marketplace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{brand.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <BrandStorefront brand={brand} products={products} />
    </div>
  );
}
