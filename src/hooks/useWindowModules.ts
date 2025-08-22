'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
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

// Create context for theme
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const isMobile = useIsMobile();
  const { isPanelOpen } = useCopilot();
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
  )
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mode, setMode] = useState<AppMode>('clinic');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial theme based on system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    if (!isClient) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

  }, [theme, isClient]);

  if (!isClient) {
    // Return a skeleton or null layout on the server to avoid hydration mismatches
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AppModeContext.Provider value={{ mode, setMode }}>
        <ModuleProvider>
          <AppContent>{children}</AppContent>
        </ModuleProvider>
      </AppModeContext.Provider>
    </ThemeContext.Provider>
  );
};

export default MainLayout;