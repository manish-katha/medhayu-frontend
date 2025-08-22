
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import animationData from '@/icons/loading.json';

const LottiePlayer = dynamic(() => import('@/components/ui/lottie-player'), {
    ssr: false,
    loading: () => <Skeleton className="w-64 h-64" />,
});

export const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <LottiePlayer animationData={animationData} className="w-64 h-64" />
    </div>
);
