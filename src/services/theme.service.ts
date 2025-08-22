
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { BookTheme } from '@/types/book';
import path from 'path';

// Define the default theme as a fallback.
const defaultTheme: BookTheme = {
  bookId: 'default',
  styles: {
    h1: {
      fontSize: "36px",
      fontWeight: "bold"
    },
    h2: {
      fontSize: "30px",
      fontWeight: "bold"
    },
    h3: {
      fontSize: "24px",
      fontWeight: "bold"
    },
    h4: {
      fontSize: "20px",
      fontWeight: "bold"
    },
    h5: {
      fontSize: "18px",
      fontWeight: "bold"
    },
    h6: {
      fontSize: "16px",
      fontWeight: "bold"
    },
    paragraph: {
      fontSize: "16px"
    },
    sutra: {
      fontFamily: "Adishila",
      color: "hsl(var(--primary))",
      fontSize: "18px"
    },
    bhashya: {
      fontStyle: "italic",
      color: "hsl(var(--muted-foreground))",
      fontSize: "16px"
    },
    teeka: {
      color: "hsl(var(--secondary-foreground))",
       fontSize: "16px"
    },
    citation: {
      color: "hsl(var(--accent))"
    },
    quotation: {
      color: "hsl(var(--info))",
      fontStyle: "italic"
    },
    version: {
      backgroundColor: "hsl(var(--primary) / 0.1)",
      color: "hsl(var(--primary))"
    },
    footnote: {
      fontSize: "14px",
      color: "hsl(var(--muted-foreground))"
    },
    specialNote: {
      fontSize: "14px",
      color: "hsl(var(--destructive))"
    },
    toc: {
        fontSize: '14px',
        color: 'hsl(var(--foreground))'
    }
  }
};

export async function getDefaultTheme(): Promise<BookTheme> {
  // In a real app, this might be configurable. For now, it's a constant.
  return Promise.resolve(defaultTheme);
}

export async function getThemeForBook(bookId: string): Promise<BookTheme> {
  const themeFilePath = path.join(corpusPath, 'themes', `${bookId}.json`);
  try {
    // Attempt to read a book-specific theme.
    // The `readJsonFile` will return null if the file doesn't exist or is empty.
    const bookTheme = await readJsonFile<BookTheme | null>(themeFilePath, null);
    
    // If a theme was read, ensure it has the correct structure before returning.
    if (bookTheme && bookTheme.styles) {
      return { ...defaultTheme, ...bookTheme, styles: { ...defaultTheme.styles, ...bookTheme.styles } };
    }
    
    // If no specific theme, or if it's invalid, return the default.
    return defaultTheme;
  } catch (error) {
    console.warn(`Could not read theme for book ${bookId}. Returning default theme.`, error);
    return defaultTheme;
  }
}

export async function saveThemeForBook(bookId: string, theme: BookTheme): Promise<void> {
  const themeFilePath = path.join(corpusPath, 'themes', `${bookId}.json`);
  await writeJsonFile(themeFilePath, theme);
}
