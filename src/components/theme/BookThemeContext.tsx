
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { BookTheme } from '@/types';

interface BookThemeContextType {
  theme: BookTheme | null;
  setTheme: (theme: BookTheme) => void;
}

const BookThemeContext = createContext<BookThemeContextType | undefined>(undefined);

export function BookThemeProvider({ theme: initialTheme, children }: { theme: BookTheme; children: ReactNode }) {
  const [theme, setTheme] = useState<BookTheme | null>(initialTheme);

  return (
    <BookThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </BookThemeContext.Provider>
  );
}

export function useBookTheme() {
  const context = useContext(BookThemeContext);
  if (context === undefined) {
    throw new Error('useBookTheme must be used within a BookThemeProvider');
  }
  return context;
}
