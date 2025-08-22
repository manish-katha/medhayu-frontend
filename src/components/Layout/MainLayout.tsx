

'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from '@/components/layout/Header';
import Footer from './Footer';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import CopilotContainer from '../CoPilot/CopilotContainer';
import { ModuleProvider } from '@/hooks/useWindowModules.tsx';


// Create context for app mode
export type AppMode = 'clinic' | 'research';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const AppModeContext = createContext<AppModeContextType>({ 
  mode: 'clinic', 
  setMode: () => {} 
});

export const useAppMode = () => useContext(AppModeContext);

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const isMobile = useIsMobile();
  
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
          <Header />
          
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col">
              {children}
            </main>
            <CopilotContainer />
          </div>
          
          <Footer />
        </div>
      </div>
  )
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mode, setMode] = useState<AppMode>('clinic');

  return (
      <AppModeContext.Provider value={{ mode, setMode }}>
        <ModuleProvider>
          <AppContent>{children}</AppContent>
        </ModuleProvider>
      </AppModeContext.Provider>
  );
};

export default MainLayout;

