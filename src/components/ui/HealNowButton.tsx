
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface HealNowButtonProps {
  onClick: () => void;
  className?: string;
}

const HealNowButton: React.FC<HealNowButtonProps> = ({ onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full text-center rounded-lg overflow-hidden p-4 h-full",
        "bg-gradient-to-br from-ayurveda-green to-ayurveda-ochre",
        "shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer",
        "flex flex-col items-center justify-center",
        className
      )}
    >
        <h2 className="text-xl md:text-2xl font-bold text-white text-shadow">
            Heal Now
        </h2>
        <p className="mt-2 text-sm text-white/90 text-shadow-sm max-w-lg mx-auto">
            Begin patient care and transform lives through authentic Ayurvedic treatment.
        </p>
        <div className="mt-6">
            <Button
                className="
                px-6 py-3 text-base font-semibold text-white bg-transparent
                border-2 border-white/50 rounded-lg shadow-lg
                transition-all duration-500
                hover:bg-black/50 hover:border-transparent hover:shadow-2xl hover:-translate-y-1
                "
            >
                <Sparkles size={16} className="mr-2"/>
                Start Consultation
            </Button>
        </div>
    </div>
  );
};

export default HealNowButton;
