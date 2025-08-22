
import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function BotLoading({ size = 'md', className, text }: BotLoadingProps) {
  const sizeMap = {
    sm: {
      container: 'w-12 h-12',
      icon: 24,
    },
    md: {
      container: 'w-20 h-20',
      icon: 36,
    },
    lg: {
      container: 'w-24 h-24',
      icon: 48,
    },
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={cn(
        "rounded-full bg-gradient-to-r from-ayurveda-green/30 to-ayurveda-ochre/30 flex items-center justify-center animate-pulse",
        sizeMap[size].container,
        className
      )}>
        <Bot size={sizeMap[size].icon} className="text-ayurveda-green" />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export default BotLoading;

    