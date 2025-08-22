
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/MarketPlace/ProductCard';
import { Product } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';

interface FeaturedSectionProps {
  featuredProducts: Product[];
  categories: { id: string; name: string }[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ 
  featuredProducts, 
  categories,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategorySelect = (categoryId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("category", categoryId);
    router.push(`/marketplace?${current.toString()}`);
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-ayurveda-brown">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-ayurveda-brown">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.filter(c => c.id !== 'all').map(category => (
            <Button 
              key={category.id} 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center text-center"
              onClick={() => handleCategorySelect(category.id.toLowerCase().replace(/\s+/g, '-'))}
            >
              <span className="text-sm">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeaturedSection;
