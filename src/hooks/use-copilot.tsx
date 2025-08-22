
'use client';

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

interface CopilotContextType {
  isPanelOpen: boolean;
  openCopilotPanel: () => void;
  closeCopilotPanel: () => void;
  toggleCopilotPanel: () => void;
  analysis: React.ReactNode | null;
  setAnalysis: (analysis: React.ReactNode | null) => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

interface CopilotProviderProps {
    children: ReactNode;
}

export const CopilotProvider: FC<CopilotProviderProps> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [analysis, setAnalysis] = useState<React.ReactNode | null>(null);

  const openCopilotPanel = () => {
    setIsPanelOpen(true);
  }
  
  const closeCopilotPanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
        setAnalysis(null);
    }, 300);
  }
  
  const toggleCopilotPanel = () => {
      if (isPanelOpen) {
          closeCopilotPanel();
      } else {
          openCopilotPanel();
      }
  }

  const value = { isPanelOpen, openCopilotPanel, closeCopilotPanel, toggleCopilotPanel, analysis, setAnalysis };

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (context === undefined) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};
