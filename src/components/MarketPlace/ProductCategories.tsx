
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Hospital } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Daily Use Chikitsa', usedIn: 120, badge: "Recommended by your Circle" },
  { name: 'PanchaKarma Supplies', usedIn: 95 },
  { name: 'Clinic Essentials', usedIn: 250 },
  { name: 'Dispensary Packaging', usedIn: 180 },
  { name: 'Taila & Ghrita Collection', usedIn: 75, badge: "Top Rated" },
  { name: 'Ready-made Classical Combinations', usedIn: 300 },
];

const ProductCategories: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-ayurveda-brown">Product Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/marketplace?q=')}>
                        <CardHeader>
                            <h3 className="font-semibold">{category.name}</h3>
                            {category.badge && <Badge variant="secondary" className="w-fit">{category.badge}</Badge>}
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                             <div className="flex items-center gap-1.5">
                                <Hospital size={14} />
                                <span>Used in {category.usedIn}+ Clinics</span>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-ayurveda-green">See Vaidya Reviews</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProductCategories;
