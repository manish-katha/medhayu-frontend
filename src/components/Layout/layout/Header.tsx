
'use client';

import React, { useState } from 'react';
import { Stethoscope, Microscope, Sun, Moon, Sparkles, ShoppingCart, Bell, MessageSquare, Wallet } from 'lucide-react';
import { useAppMode } from '@/components/Layout/MainLayout';
import AyurvedicClock from '../AyurvedicClock';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CartDialog from '@/components/MarketPlace/CartDialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useCart } from '@/hooks/use-cart';

const Header = () => {
  const { mode, setMode } = useAppMode();
  const { theme, setTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    const bgMask = document.getElementById('bg-mask');
    if (bgMask) {
      bgMask.classList.remove('animation');
      void bgMask.offsetWidth; // Trigger reflow
      bgMask.classList.add('animation');
    }
    
    setTimeout(() => {
      setTheme(newTheme);
    }, 250);
  };

  return (
    <>
    <header className="bg-transparent border-b border-border px-6 py-2 shrink-0 sticky top-0 z-40">
      <div className="flex justify-between items-center h-12">
        <div className="flex items-center gap-4">
          <AyurvedicClock />
           <div className="relative flex w-[220px] p-1 bg-muted rounded-full">
              <div 
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-full shadow-md transition-transform duration-300 ease-in-out",
                    mode === 'clinic' ? 'transform translate-x-1' : 'transform translate-x-[calc(100%+3px)]'
                )}
              />
              <button className="relative w-1/2 p-1 text-center text-sm font-semibold z-10 transition-colors flex items-center justify-center gap-1"
                     onClick={() => setMode('clinic')}>
                <Stethoscope size={14} className={cn(mode === 'clinic' ? 'text-ayurveda-green' : 'text-muted-foreground')} />
                <span className={cn(mode === 'clinic' ? 'text-foreground' : 'text-muted-foreground')}>Clinic</span>
              </button>
              <button className="relative w-1/2 p-1 text-center text-sm font-semibold z-10 transition-colors flex items-center justify-center gap-1"
                     onClick={() => setMode('research')}>
                 <Microscope size={14} className={cn(mode === 'research' ? 'text-ayurveda-green' : 'text-muted-foreground')} />
                 <span className={cn(mode === 'research' ? 'text-foreground' : 'text-muted-foreground')}>Research</span>
              </button>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleThemeChange}
                aria-label="Toggle theme"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
             <Link href="/wallet" passHref>
                <Button variant="outline" className="h-9">
                    <Wallet size={16} className="mr-2"/>
                    <span className="text-sm">₹5,300.00</span>
                </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-ayurveda-terracotta rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
                <MessageSquare size={20} />
            </Button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
