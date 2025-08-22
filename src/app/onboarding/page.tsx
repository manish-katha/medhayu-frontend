
'use client';

import React from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { OmIcon } from '@/components/ui/icons';
import Link from 'next/link';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="mx-auto w-full max-w-3xl">
                 <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 mb-2">
                        <OmIcon className="h-10 w-10 text-primary" />
                        <span className="font-headline text-4xl font-bold">MEDHAYU</span>
                    </Link>
                    <p className="text-muted-foreground">Join our community of scholars and practitioners.</p>
                </div>
                <OnboardingForm />
            </div>
        </div>
    );
}
