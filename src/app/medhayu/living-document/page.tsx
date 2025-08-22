

import { getBooks, getBookContent } from '@/services/book.service';
import { getFullGlossary } from '@/services/glossary.service';
import { getBookmarksForUser } from '@/services/user.service';
import { getThemeForBook, getDefaultTheme } from '@/services/theme.service';
import type { Book, BookContent, GlossaryTerm, Bookmark, Chapter, Article } from '@/types';
import { LivingDocumentClient } from '@/components/medhayu/living-document/living-document-client';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { findFirstArticle } from '@/services/service-utils';
import { LoadingFallback } from '@/components/medhayu/living-document/loading-fallback';


async function LivingDocumentPageLoader({ searchParams }: { searchParams: { bookId?: string } }) {
    const [books, glossary, bookmarks, defaultTheme] = await Promise.all([
        getBooks(),
        getFullGlossary(),
        getBookmarksForUser('default-user'), // Assuming a default user
        getDefaultTheme(),
    ]);

    let initialBookContent: BookContent | null = null;
    let initialTheme = defaultTheme;
    const bookIdFromParams = searchParams.bookId;
    let targetBookId = bookIdFromParams || (books.length > 0 ? books[0].id : null);

    let initialChapter: Chapter | null = null;
    let initialArticle: Article | null = null;

    if (targetBookId) {
        initialBookContent = await getBookContent(targetBookId);
        if (initialBookContent) {
            const firstUnit = findFirstArticle(initialBookContent.chapters);
            if (firstUnit) {
                initialChapter = firstUnit.chapter;
                initialArticle = firstUnit.article;
            }
            const bookTheme = await getThemeForBook(targetBookId);
            initialTheme = bookTheme || defaultTheme;
        }
    }
    
    // If a book was selected but no content could be loaded, it might be an error or empty book.
    // For this flow, we'll treat it as "not found" if a specific bookId was requested.
    if (bookIdFromParams && !initialBookContent) {
        notFound();
    }

    return (
        <LivingDocumentClient
            books={books}
            initialBookContent={initialBookContent}
            initialChapter={initialChapter}
            initialArticle={initialArticle}
            initialTheme={initialTheme}
            glossary={glossary}
            bookmarks={bookmarks || []}
            defaultTheme={defaultTheme}
            selectedBookId={targetBookId || null}
        />
    );
}

export default function LivingDocumentPage({ searchParams }: { searchParams: { bookId?: string } }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LivingDocumentPageLoader searchParams={searchParams} />
        </Suspense>
    );
}

