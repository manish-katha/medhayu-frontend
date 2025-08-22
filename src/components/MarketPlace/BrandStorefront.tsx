
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/MarketPlace/ProductCard';
import type { Brand } from '@/types/brand';
import type { Product } from '@/types/product';
import { BadgeCheck, Users, Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';

interface BrandStorefrontProps {
  brand: Brand;
  products: Product[];
}

export function BrandStorefront({ brand, products }: BrandStorefrontProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    return (
        <div className="space-y-8">
            {/* Brand Header */}
            <div className="p-6 rounded-lg border bg-card">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative w-24 h-24 bg-background rounded-md border p-2 flex-shrink-0">
                        <Image src={brand.logo} alt={brand.name} layout="fill" objectFit="contain" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{brand.name}</h1>
                        <p className="text-muted-foreground mt-1">{brand.tagline}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                             <Badge variant="secondary" className="gap-2 py-1 px-3">
                                <Users size={16} /> Attested by {brand.attestations.vaidyaCount} Vaidyas
                            </Badge>
                             <Badge variant="outline" className="gap-2 py-1 px-3">
                                <BadgeCheck size={16} className="text-ayurveda-green" /> {brand.attestations.certification}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* About Section */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold border-b pb-2">About {brand.name}</h2>
                <p>{brand.description}</p>
            </div>
            
            {/* Product Listing */}
            <div>
                 <h2 className="text-2xl font-semibold mb-4">Products</h2>
                 <div className="flex justify-between items-center mb-4 p-2 border rounded-md bg-muted/50">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={`Search ${brand.name} products...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline"><Filter size={16} className="mr-2"/>Filters</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

             {/* Testimonials */}
            {brand.testimonials && brand.testimonials.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Why Vaidyas Prefer {brand.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {brand.testimonials.map((testimonial, index) => (
                        <blockquote key={index} className="p-4 border rounded-lg bg-background">
                            <p className="italic">"{testimonial.quote}"</p>
                            <footer className="mt-2 text-right text-sm font-semibold">
                            — {testimonial.author}
                            </footer>
                        </blockquote>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
