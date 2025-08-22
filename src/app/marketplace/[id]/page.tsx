

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/services/product.service';
import ProductDetailClient from './ProductDetailClient';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params: paramsProp }: ProductDetailPageProps) {
  const params = use(paramsProp);
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/marketplace">Marketplace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ProductDetailClient product={product} />
    </div>
  );
}
