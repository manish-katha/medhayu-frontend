
'use client';

import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface RecommendedByCircleProps {
    products: Product[];
}

const RecommendedByCircle: React.FC<RecommendedByCircleProps> = ({ products }) => {
    return (
         <div>
            <div className="mb-4">
                <h2 className="text-2xl font-semibold text-ayurveda-brown">Your Circle Recommends</h2>
                <p className="text-muted-foreground">Clinics like yours prefer these products.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={{...product, recommendedBy: "Sharma"}} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedByCircle;
