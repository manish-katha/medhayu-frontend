
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import slugify from 'slugify';

const brandsData = [
  { name: 'Kalpatantra Ayurveda', tagline: 'GMP + Clinical Trial Certified', logo: 'https://placehold.co/150x50/c4913f/FFFFFF/png?text=Kalpatantra' },
  { name: 'Oshadham Wellness', tagline: 'Used in 380+ clinics across India', logo: 'https://placehold.co/150x50/678b61/FFFFFF/png?text=Oshadham' },
  { name: 'Atharva Ayurveda', tagline: 'Focused on Rare Formulations', logo: 'https://placehold.co/150x50/a86c5d/FFFFFF/png?text=Atharva' },
  { name: 'Himalaya Wellness', tagline: 'Trusted since 1930', logo: 'https://placehold.co/150x50/264653/FFFFFF/png?text=Himalaya' }
];

const AttestedBrands: React.FC = () => {
    const sortedBrands = [...brandsData].sort((a, b) => {
        if (a.name === 'Oshadham Wellness') return -1;
        if (b.name === 'Oshadham Wellness') return 1;
        return 0;
    });

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-ayurveda-brown">Attested Brands</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sortedBrands.map((brand) => (
                    <Link key={brand.name} href={`/marketplace/brands/${slugify(brand.name, { lower: true, strict: true })}`} passHref>
                        <Card className="flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow h-full">
                            <div className="h-12 flex items-center justify-center mb-2">
                                 <Image src={brand.logo} alt={`${brand.name} logo`} width={150} height={50} className="object-contain" />
                            </div>
                            <p className="text-xs text-center text-muted-foreground">{brand.tagline}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AttestedBrands;
