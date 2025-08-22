
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_MODULES, ALL_MEDHAYU_MODULES, ModuleKey, MedhayuModuleKey } from '@/components/Layout/menu-config';
import { arrayMove } from '@dnd-kit/sortable';

interface ModuleContextType {
  currentModules: ModuleKey[];
  currentMedhayuModules: MedhayuModuleKey[];
  isModuleActive: (module: ModuleKey) => boolean;
  toggleModule: (module: ModuleKey) => void;
  detachModule: (module: ModuleKey) => void;
  attachModule: (module: ModuleKey) => void;
  reorderModules: (oldIndex: number, newIndex: number) => void;
  reorderMedhayuModules: (oldIndex: number, newIndex: number) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

const getWindowId = (): string => {
  if (typeof window === 'undefined') return 'server';
  if (!window.name || !window.name.startsWith('opdo-window-')) {
    window.name = `opdo-window-${Date.now()}`;
  }
  return window.name;
};

const channel = typeof window !== 'undefined' ? new BroadcastChannel('opdo_module_channel') : null;

export const ModuleProvider = ({ children }: { children: ReactNode }) => {
  const [currentModules, setCurrentModules] = useState<ModuleKey[]>(ALL_MODULES);
  const [currentMedhayuModules, setCurrentMedhayuModules] = useState<MedhayuModuleKey[]>(ALL_MEDHAYU_MODULES);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const windowId = getWindowId();
    
    try {
      const storedModules = localStorage.getItem(`opdo-modules-${windowId}`);
      if (storedModules) {
        setCurrentModules(JSON.parse(storedModules));
      }
    } catch (e) {
      console.error("Failed to parse modules from localStorage", e);
    }

    try {
      const storedMedhayuModules = localStorage.getItem(`opdo-medhayu-modules-${windowId}`);
      if (storedMedhayuModules) {
        setCurrentMedhayuModules(JSON.parse(storedMedhayuModules));
      }
    } catch(e) {
      console.error("Failed to parse medhayu modules from localStorage", e);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const windowId = getWindowId();
      localStorage.setItem(`opdo-modules-${windowId}`, JSON.stringify(currentModules));
      localStorage.setItem(`opdo-medhayu-modules-${windowId}`, JSON.stringify(currentMedhayuModules));
    }
  }, [currentModules, currentMedhayuModules, isInitialized]);

  const isModuleActive = useCallback((module: ModuleKey) => currentModules.includes(module), [currentModules]);
  
  const toggleModule = (module: ModuleKey) => {
    if (!isInitialized) return;
    setCurrentModules(prev => {
      const isActive = prev.includes(module);
      if (isActive) {
        return prev.length > 1 ? prev.filter(m => m !== module) : prev;
      } else {
        const newModules = [...prev, module];
        return ALL_MODULES.filter(m => newModules.includes(m));
      }
    });
  };

  const detachModule = (module: ModuleKey) => {
    if (currentModules.length <= 1) {
      return;
    }
    
    const newWindowId = `opdo-window-${module}-${Date.now()}`;
    localStorage.setItem(`opdo-modules-${newWindowId}`, JSON.stringify([module]));
    window.open(`/`, newWindowId, 'width=1200,height=800,noopener,noreferrer');

    channel?.postMessage({
        type: 'module_detached',
        module: module,
        sourceWindowId: getWindowId()
    });

    setCurrentModules(prev => prev.filter(m => m !== module));
  };

  const attachModule = (module: ModuleKey) => {
    if (!isModuleActive(module)) {
      setCurrentModules(prev => [...prev, module]);
    }
  };
  
  const reorderModules = useCallback((oldIndex: number, newIndex: number) => {
    setCurrentModules(prev => arrayMove(prev, oldIndex, newIndex));
  }, []);

  const reorderMedhayuModules = useCallback((oldIndex: number, newIndex: number) => {
    setCurrentMedhayuModules(prev => arrayMove(prev, oldIndex, newIndex));
  }, []);

  const value = { currentModules, currentMedhayuModules, isModuleActive, toggleModule, detachModule, attachModule, reorderModules, reorderMedhayuModules };

  return (
    <ModuleContext.Provider value={value}>
      {isInitialized ? children : null}
    </ModuleContext.Provider>
  );
};

export const useWindowModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useWindowModules must be used within a ModuleProvider');
  }
  return context;
};
