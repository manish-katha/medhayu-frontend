
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
    bookmarks,
    defaultTheme,
    selectedBookId,
}: LivingDocumentClientProps) {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false); 
  
  const [bookContent, setBookContent] = useState<BookContent | null>(initialBookContent);
  const [chapter, setChapter] = useState<Chapter | null>(initialChapter);
  const [article, setArticle] = useState<Article | null>(initialArticle);
  
  // This effect ensures state is updated when props change due to navigation
  useEffect(() => {
    setBookContent(initialBookContent);
    setChapter(initialChapter);
    setArticle(initialArticle);
    setIsLoading(false); 
  }, [selectedBookId, initialBookContent, initialChapter, initialArticle]);

  const handleSelectBook = (bookId: string) => {
    if (!bookId || bookId === selectedBookId) return;
    setIsLoading(true);
    router.push(`/medhayu/living-document?bookId=${bookId}`);
  };

  const handleSelectUnit = (selectedChapter: Chapter, selectedArticle: Article) => {
    setChapter(selectedChapter);
    setArticle(selectedArticle);
  };
  
  const findArticle = (offset: 1 | -1): { chapter: Chapter; article: Article } | null => {
      if (!bookContent || !chapter || !article || !Array.isArray(bookContent.chapters)) return null;
      
      const allArticles: { chapter: Chapter; article: Article }[] = [];
      const flatten = (chapters: Chapter[]) => {
          for (const chap of chapters) {
              if(chap.articles) {
                chap.articles.forEach(art => allArticles.push({ chapter: chap, article: art }));
              }
              if (chap.children) flatten(chap.children);
          }
      };
      flatten(bookContent.chapters);
      
      const currentIndex = allArticles.findIndex(item => 
          String(item.chapter.id) === String(chapter.id) && String(item.article.verse) === String(article.verse)
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
          handleSelectUnit(nextUnit.chapter, nextUnit.article);
      }
  };

  return (
    <BookThemeProvider theme={initialTheme}>
        <TransliterationProvider>
            <ArticlePageUI
                books={books}
                book={bookContent}
                chapter={chapter}
                article={article}
                prevArticle={findArticle(-1)?.article || null}
                nextArticle={findArticle(1)?.article || null}
                glossary={glossary}
                bookmarks={bookmarks}
                selectedBookId={selectedBookId}
                onSelectBook={handleSelectBook}
                onSelectUnit={handleSelectUnit}
                onPrev={() => navigateArticle(-1)}
                onNext={() => navigateArticle(1)}
                isLoading={isLoading}
            />
        </TransliterationProvider>
    </BookThemeProvider>
  );
}
