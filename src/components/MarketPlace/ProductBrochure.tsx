
'use client';

import React from 'react';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { InfoChip } from '@/components/MarketPlace/InfoChip';
import { FlaskConical, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';


interface ProductBrochureProps {
  product: Product;
}

const ProductBrochure: React.FC<ProductBrochureProps> = ({ product }) => {
  return (
    <div className="bg-white p-8 font-sans text-gray-800" style={{ width: '210mm', minHeight: '297mm', margin: 'auto' }}>
      {/* Header with Cover Image and Profile Image */}
      <div className="relative mb-24">
        <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={product.coverImage || 'https://placehold.co/1200x400.png'}
            alt={`${product.name} cover`}
            width={1200}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-40 left-8 flex items-end gap-6">
          <div className="relative w-40 h-40 border-4 border-white rounded-lg shadow-lg bg-white">
            <Image
              src={product.image}
              alt={product.name}
              width={160}
              height={160}
              className="object-cover w-full h-full rounded-md"
            />
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.sanskritName && `(${product.sanskritName})`} • {product.botanicalName}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold border-b-2 border-ayurveda-green pb-2 mb-3">Description</h2>
            <div className="prose prose-base max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {/* Scientific Details */}
          <div>
            <h2 className="text-xl font-semibold border-b-2 border-ayurveda-green pb-2 mb-3">Scientific Details</h2>
            <div className="space-y-3">
              <InfoChip label="Main Constituents" value={product.mainConstituents} icon={<FlaskConical size={14}/>} />
              <InfoChip label="Pharmacological Use" value={product.pharmacologicalUse} icon={<Leaf size={14}/>} />
            </div>
          </div>
        </div>
        
        {/* Right Column for Ayurvedic Properties */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-xl font-semibold border-b-2 border-ayurveda-green pb-2 mb-3">Dravya Guna</h2>
           <div className="space-y-2">
                <InfoChip label="Rasa (Taste)" value={product.rasa} />
                <InfoChip label="Guna (Qualities)" value={product.guna} />
                <InfoChip label="Virya (Potency)" value={product.virya} />
                <InfoChip label="Vipaka (Post-digestive)" value={product.vipaka} />
                <InfoChip label="Karma (Actions)" value={product.karma} />
                <InfoChip label="Dosha Action" value={product.doshaAction} />
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>Oshadham Ayurveda | www.oshadham.com</p>
        <p>This brochure is for informational purposes only. Consult a qualified Ayurvedic practitioner before use.</p>
      </div>
    </div>
  );
};

export default ProductBrochure;
