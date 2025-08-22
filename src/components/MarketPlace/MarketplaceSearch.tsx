
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';

interface MarketplaceSearchProps {
  searchQuery: string;
  activeFilter: boolean;
}

const MarketplaceSearch: React.FC<MarketplaceSearchProps> = ({
  searchQuery: initialSearchQuery,
  activeFilter,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    const handler = setTimeout(() => {
      if (isClient && searchQuery !== initialSearchQuery) {
        handleSearch();
      }
    }, 500); // Debounce search

    return () => clearTimeout(handler);
  }, [searchQuery, isClient]);

  const handleSearch = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!searchQuery) {
      current.delete("q");
    } else {
      current.set("q", searchQuery);
    }
    
    // go to first page on new search
    current.delete("page");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/marketplace${query}`);
  };

  const toggleFilters = () => {
     const current = new URLSearchParams(Array.from(searchParams.entries()));
     if (activeFilter) {
       current.delete('filters');
     } else {
       current.set('filters', 'true');
     }
     router.push(`/marketplace?${current.toString()}`);
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-ayurveda-brown mb-2">Marketplace</h1>
        <p className="text-muted-foreground">Discover quality products for your Ayurvedic practice</p>
      </div>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search products..."
            className="pl-10 w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={toggleFilters}
        >
          <Filter size={16} />
          <span>Filters</span>
          <ChevronDown size={16} className={activeFilter ? 'transform rotate-180 transition-transform' : 'transition-transform'} />
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceSearch;
