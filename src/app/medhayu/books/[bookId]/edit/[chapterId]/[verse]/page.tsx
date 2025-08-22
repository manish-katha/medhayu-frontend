

import React from 'react';
import { getArticle as getArticleData } from '@/services/book.service';
import { notFound } from 'next/navigation';
import { EditArticlePageClient } from './EditArticlePageClient';
import { Loader2 } from 'lucide-react';
import { BookThemeProvider } from '@/components/theme/BookThemeContext';
import { getThemeForBook, getDefaultTheme } from '@/services/theme.service';
import { TransliterationProvider } from '@/components/transliteration-provider';

// This is the main Server Component for the page.
export default async function EditArticlePage(props: { params: { bookId: string; chapterId: string, verse: string } }) {
    const { params } = props;
    
    // Validate parameters on the server
    const { bookId, chapterId, verse } = params;

    if (!bookId || !chapterId || !verse) {
        notFound();
    }
    
    // Fetch initial data on the server
    const [initialArticleData, initialTheme, defaultTheme] = await Promise.all([
        getArticleData(bookId, chapterId, verse),
        getThemeForBook(bookId),
        getDefaultTheme()
    ]);
    
    if (!initialArticleData) {
        notFound();
    }

    const themeToLoad = initialTheme.bookId === 'default' ? { ...defaultTheme, bookId } : initialTheme;

    return (
      <TransliterationProvider>
        <BookThemeProvider theme={themeToLoad}>
            <EditArticlePageClient 
                initialArticleData={initialArticleData}
                params={params} 
            />
        </BookThemeProvider>
      </TransliterationProvider>
    );
}
