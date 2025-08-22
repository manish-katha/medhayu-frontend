
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Check, Hospital, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { useCart } from '@/hooks/use-cart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVendor = product.vendors?.[0] || { id: 'vendor-1', name: 'Herbal Suppliers Ltd.' };
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price) || 0,
      mrp: product.mrp,
      quantity: 1, // Default quantity
      vendorId: defaultVendor.id,
      availableVendors: product.vendors || [],
      clinicId: "clinic-001", // Default clinic
    });
  };


  return (
    <>
      <Link href={`/marketplace/${product.id}`} passHref>
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col cursor-pointer group">
            <div className="relative h-48 bg-muted overflow-hidden">
              <Image 
                  src={product.image} 
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="product photo"
              />
            </div>
            <CardHeader className="p-3">
               <p className="text-xs text-muted-foreground">{product.category}</p>
              <h3 className="font-semibold line-clamp-2 text-base leading-tight">{product.name}</h3>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-grow">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-ayurveda-green" />
                  <span>Attested by {product.attestedByVaidyas} Vaidyas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hospital size={14} className="text-ayurveda-green" />
                  <span>Used in {product.usedInClinics}+ Clinics</span>
                </div>
                {product.recommendedBy && (
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-ayurveda-green" />
                    <span>Recommended by Dr. {product.recommendedBy}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 mt-auto">
              <Button 
                  className="w-full bg-ayurveda-green hover:bg-ayurveda-green/90"
                  onClick={handleAddToCart}
              >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
              </Button>
            </CardFooter>
        </Card>
      </Link>
    </>
  );
};

export default ProductCard;
