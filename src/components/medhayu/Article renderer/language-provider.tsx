'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ml', name: 'Malayalam' },
];

interface LanguageContextType {
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [targetLang, setTargetLangState] = useState<string>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem('vaikhari-lang');
    if (storedLang && SUPPORTED_LANGUAGES.some(l => l.code === storedLang)) {
      setTargetLangState(storedLang);
    }
  }, []);

  const setTargetLang = (lang: string) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
      setTargetLangState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaikhari-lang', lang);
      }
    }
  };

  const value = {
    targetLang,
    setTargetLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
