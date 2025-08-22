
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const HeroSection: React.FC = () => {
    const router = useRouter();

    const handleExplore = () => {
        // Trigger a search for all products to show the listing view
        router.push('/marketplace?q=');
    };

    return (
        <div className="text-center py-12 md:py-20 rounded-lg bg-gradient-to-br from-ayurveda-green/10 to-ayurveda-ochre/10 border">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-ayurveda-brown">
                Crafted by Nature. Recommended by Vaidyas. Powered for Clinics.
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
                A dedicated Ayurvedic practitioner marketplace — where every product is attested, clinically used, and verified by the Ayurveda community.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={handleExplore}>Explore Products</Button>
                <Button variant="outline">View Attested Brands</Button>
            </div>
        </div>
    );
};

export default HeroSection;
