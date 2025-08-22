
'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { useSearchParams } from 'next/navigation';
import MarketplaceSearch from '@/components/MarketPlace/MarketplaceSearch';
import HeroSection from '@/components/MarketPlace/HeroSection';
import ProductCategories from '@/components/MarketPlace/ProductCategories';
import RecommendedByCircle from '@/components/MarketPlace/RecommendedByCircle';
import AttestedBrands from '@/components/MarketPlace/AttestedBrands';
import ProductListing from '@/components/MarketPlace/ProductListing';


interface MarketplaceClientPageProps {
  allProducts: Product[];
}

export default function MarketplaceClientPage({ allProducts }: MarketplaceClientPageProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const showFilters = searchParams.get('filters') === 'true';

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allProducts, searchQuery]);
  
  // If there's a search query, we show the listing, otherwise the curated sections.
  const showListing = searchQuery !== '';

  return (
    <div className="space-y-8 md:space-y-12">
      <MarketplaceSearch
        searchQuery={searchQuery}
        activeFilter={showFilters}
      />
      
      {showListing ? (
        <ProductListing 
            products={filteredProducts}
            searchQuery={searchQuery}
            category={'All Products'}
        />
      ) : (
        <>
            <HeroSection />
            <ProductCategories />
            <RecommendedByCircle products={allProducts.filter(p => p.rating > 4.7)} />
            <AttestedBrands />
        </>
      )}
    </div>
  );
}
