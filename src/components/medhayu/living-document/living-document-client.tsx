
'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Book, BookContent, Chapter, Article, GlossaryTerm, Bookmark, BookTheme, GlossaryCategory } from '@/types';
import { BookThemeProvider } from '@/components/theme/BookThemeContext';
import { TransliterationProvider } from '@/components/transliteration-provider';
import { Loader2 } from 'lucide-react';
import { ArticlePageUI } from '@/app/medhayu/living-document/article-page-ui';

interface LivingDocumentClientProps {
  books: Book[];
  initialBookContent: BookContent | null;
  initialChapter: Chapter | null;
  initialArticle: Article | null;
  glossary: GlossaryTerm[];
  bookmarks: Bookmark[];
  selectedBookId: string | null;
  initialTheme: BookTheme;
  defaultTheme: BookTheme;
}

export function LivingDocumentClient({ 
    books, 
    initialBookContent,
    initialChapter,
    initialArticle,
    initialTheme,
    glossary,
    bookmarks: initialBookmarks,
    defaultTheme,
    selectedBookId,
}: LivingDocumentClientProps) {
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); 
  
  const [currentBookContent, setCurrentBookContent] = useState<BookContent | null>(initialBookContent);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(initialChapter);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(initialArticle);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [activeGlossary, setActiveGlossary] = useState<GlossaryCategory | null>(null);

  
  // This hook ensures that when the server sends new initial props (after navigation),
  // the client state is updated to match.
  useEffect(() => {
    setCurrentBookContent(initialBookContent);
    setCurrentChapter(initialChapter);
    setCurrentArticle(initialArticle);
    setBookmarks(initialBookmarks);
    setIsLoading(false); // Ensure loading is turned off when new props arrive
  }, [initialBookContent, initialChapter, initialArticle, initialBookmarks]);

  const handleSelectBook = (bookId: string) => {
    if (!bookId || bookId === selectedBookId) return;
    setIsLoading(true);
    router.push(`/medhayu/living-document?bookId=${bookId}`);
  };

  const onSelectUnit = useCallback((chapter: Chapter, article: Article) => {
    setCurrentChapter(chapter);
    setCurrentArticle(article);
  }, []);
  
  const findArticle = (offset: 1 | -1): { chapter: Chapter; article: Article } | null => {
      if (!currentBookContent || !currentChapter || !currentArticle || !Array.isArray(currentBookContent.chapters)) return null;
      
      const allArticles: { chapter: Chapter; article: Article }[] = [];
      const flatten = (chapters: Chapter[]) => {
          for (const chap of chapters) {
              if(chap.articles) {
                chap.articles.forEach(art => allArticles.push({ chapter: chap, article: art }));
              }
              if (chap.children) flatten(chap.children);
          }
      };
      flatten(currentBookContent.chapters);
      
      const currentIndex = allArticles.findIndex(item => 
          String(item.chapter.id) === String(currentChapter.id) && String(item.article.verse) === String(currentArticle.verse)
      );

      if (currentIndex === -1) return null;

      const nextIndex = currentIndex + offset;
      if (nextIndex >= 0 && nextIndex < allArticles.length) {
          return allArticles[nextIndex];
      }
      return null;
  };
  
  const navigateArticle = (offset: 1 | -1) => {
      const nextUnit = findArticle(offset);
      if (nextUnit) {
          onSelectUnit(nextUnit.chapter, nextUnit.article);
      }
  };


  return (
    <BookThemeProvider theme={initialTheme}>
        <TransliterationProvider>
            <ArticlePageUI
                books={books}
                book={currentBookContent}
                chapter={currentChapter}
                article={currentArticle}
                prevArticle={findArticle(-1)?.article || null}
                nextArticle={findArticle(1)?.article || null}
                glossary={glossary}
                bookmarks={bookmarks}
                selectedBookId={selectedBookId}
                activeGlossary={activeGlossary}
                onSelectBook={handleSelectBook}
                onSelectUnit={onSelectUnit}
                onPrev={() => navigateArticle(-1)}
                onNext={() => navigateArticle(1)}
                isLoading={isLoading}
                onActiveGlossaryChange={setActiveGlossary}
            />
        </TransliterationProvider>
    </BookThemeProvider>
  );
}

