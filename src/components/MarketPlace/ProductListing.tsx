
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/MarketPlace/ProductCard';
import { Product } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';

interface ProductListingProps {
  products: Product[];
  searchQuery: string;
  category: string;
}

const ProductListing: React.FC<ProductListingProps> = ({ 
  products, 
  searchQuery, 
  category
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clearFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('q');
    current.delete('category');
    router.push(`/marketplace?${current.toString()}`);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-ayurveda-brown">
          Products
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select className="text-sm border rounded p-1 bg-background">
            <option>Popularity</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
            <option>Usage Frequency</option>
          </select>
        </div>
      </div>
      
      {/* Active Filters */}
      {(searchQuery || category !== 'all') && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">Active filters:</span>
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {searchQuery}
            </Badge>
          )}
          {category !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1 capitalize">
              Category: {category.replace(/-/g, ' ')}
            </Badge>
          )}
          <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={clearFilters}>
              Clear All
          </Button>
        </div>
      )}
      
      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
