

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type WeatherCondition = 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';

interface WeatherIconProps {
  className?: string;
  children: React.ReactNode;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ className, children }) => {
  return (
    <div className={cn('relative w-10 h-10', className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5 z-10">
          {children}
      </div>
    </div>
  );
};
