

import React, { use } from 'react';
import { getArticle as getArticleData } from '@/services/book.service';
import { notFound } from 'next/navigation';
import { EditArticlePageClient } from './EditArticlePageClient';
import { Loader2 } from 'lucide-react';
import { BookThemeProvider } from '@/components/theme/BookThemeContext';
import { getThemeForBook, getDefaultTheme } from '@/services/theme.service';

// This is the main Server Component for the page.
export default async function EditArticlePage({ params: paramsProp }: { params: { bookId: string; slug: string[] } }) {
    const params = use(paramsProp);
    
    // Validate parameters on the server
    const bookId = params.bookId;
    const chapterId = params.slug?.[0];
    const verse = params.slug?.[1];

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

    const themeToLoad = initialTheme.bookId === 'default' ? { ...initialTheme, bookId } : initialTheme;

    return (
        <BookThemeProvider theme={themeToLoad}>
            <EditArticlePageClient 
                initialArticleData={initialArticleData}
                params={params} 
            />
        </BookThemeProvider>
    );
}
