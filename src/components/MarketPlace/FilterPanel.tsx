
'use client';

import React, { useState, useEffect } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import FilterAccordionItem from './Filters/FilterAccordionItem';
import CheckboxFilterGroup from './Filters/CheckboxFilterGroup';
import PriceRangeFilter from './Filters/PriceRangeFilter';
import ActiveFiltersSection from './Filters/ActiveFiltersSection';
import { useRouter, useSearchParams } from 'next/navigation';

const FilterPanel: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper function to update URL search params
  const updateSearchParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === null || value === '') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/marketplace${query}`);
  };

  const handleCategoryChange = (categories: string[]) => {
    // For now, we only support a single category filter in the URL
    updateSearchParam('category', categories[0] || 'all');
  };

  const handlePriceChange = (priceRange: [number, number]) => {
    updateSearchParam('price', `${priceRange[0]}-${priceRange[1]}`);
  };

  const handleExpiryChange = (expiry: string[]) => {
    // This functionality can be built out if needed
  };

  const resetAllFilters = () => {
    router.push('/marketplace?filters=true'); // Keep filters open
  };

  const categories = ["herb", "finished", "raw", "compound", "service"];
  const expiryPeriods = ["Less than 6 months", "6-12 months", "1-2 years", "More than 2 years"];

  return (
    <div className="bg-background p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="link" className="text-sm p-0 h-auto" onClick={resetAllFilters}>
          Reset All
        </Button>
      </div>
      
      <Accordion type="multiple" defaultValue={["categories", "price", "expiry"]}>
        <FilterAccordionItem value="categories" title="Categories">
          <CheckboxFilterGroup 
            items={categories} 
            groupName="category" 
            onSelectionChange={handleCategoryChange}
          />
        </FilterAccordionItem>
        
        <FilterAccordionItem value="price" title="Price Range">
          <PriceRangeFilter 
            min={0} 
            max={15000} 
            defaultValue={[0, 15000]} 
            step={100} 
            onValueChange={handlePriceChange}
          />
        </FilterAccordionItem>
        
        <FilterAccordionItem value="expiry" title="Expiry Period">
          <CheckboxFilterGroup 
            items={expiryPeriods} 
            groupName="expiry" 
            onSelectionChange={handleExpiryChange}
          />
        </FilterAccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterPanel;
