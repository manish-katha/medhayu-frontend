
'use client';

import React, { useEffect, useState } from 'react';
import CopilotPanel from './CopilotPanel';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import LottiePlayer from '../ui/LottiePlayer';
import askAcharyajiAnimation from '@/icons/ask acharyaji.json';

const CopilotContainer = () => {
  const { isPanelOpen, toggleCopilotPanel } = useCopilot();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={cn(
          "bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 border-l relative",
          "w-12"
      )}>
        <div className="h-full flex items-start justify-center pt-4">
           {/* Placeholder or loader can go here */}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
        "bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 border-l relative",
        isPanelOpen ? "w-[300px]" : "w-12"
    )}>
        {isPanelOpen ? (
            <CopilotPanel />
        ) : (
             <div className="h-full flex items-start justify-center pt-4">
                <Button
                    onClick={toggleCopilotPanel}
                    variant="glow"
                    size="icon"
                    className="w-10 h-10 hover:bg-transparent"
                    aria-label="Open Ayurveda Copilot"
                >
                    <LottiePlayer animationData={askAcharyajiAnimation} />
                </Button>
            </div>
        )}
    </div>
  );
};

export default CopilotContainer;
