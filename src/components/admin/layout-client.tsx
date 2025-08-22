
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import CopilotContainer from '../CoPilot/CopilotContainer';
import { AppMode, AppModeContext, Theme, ThemeContext, useAppMode, useTheme } from '@/components/Layout/MainLayout';
import { ModuleProvider } from '@/hooks/useWindowModules.tsx';

// This is a client component wrapper that allows us to use hooks
// for the admin layout, while still fetching initial data on the server.
export function AdminLayoutClient({ children, userProfile }: { children: React.ReactNode, userProfile: any }) {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const isMobile = useIsMobile();
  const { mode, setMode } = useAppMode();
  const { theme, setTheme } = useTheme();

  const toggleSidebarPin = () => {
    setSidebarPinned(prev => !prev);
  };
  
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <Sidebar pinned={sidebarPinned} togglePin={toggleSidebarPin} />
      
      <div 
        className={cn(
            "flex flex-col flex-1 overflow-hidden transition-all duration-300",
            "ml-16",
            (sidebarPinned && !isMobile) && "ml-64"
        )}
      >
        <Header mode={mode} setMode={setMode} theme={theme} setTheme={setTheme} />
        
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          <CopilotContainer />
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
