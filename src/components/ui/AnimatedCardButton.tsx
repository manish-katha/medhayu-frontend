
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const AnimatedCardButton: React.FC<AnimatedCardButtonProps> = ({ onClick, children, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full text-center rounded-lg overflow-hidden p-4",
        "bg-gradient-to-r from-blue-600 to-violet-600",
        "shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedCardButton;
