
'use client';

import Link from 'next/link';
import {
  type BookContent,
  type Chapter,
  type Article,
} from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { ScriptSwitcher } from '@/components/script-switcher';
import { BookmarkButton } from './bookmark-button';
import { SharePopover } from './share-popover';
import { Separator } from './ui/separator';
import { PrintDialog } from './print-dialog';

export function ReaderHeader({
  book,
  chapter,
  article,
  isArticleBookmarked
}: {
  book: BookContent;
  chapter: Chapter;
  article: Article;
  isArticleBookmarked: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm no-print">
      <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/books/${book.bookId}`} title={`Back to ${chapter.name}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm truncate">{book.bookName}</p>
            <p className="text-xs text-muted-foreground truncate">{chapter.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
           <ScriptSwitcher />
           <Separator orientation="vertical" className="h-6 mx-1" />
           <SharePopover />
          
          <BookmarkButton
            isBookmarked={isArticleBookmarked}
            type="article"
            book={book}
            chapter={chapter}
            article={article}
            size="icon"
          />

          <PrintDialog articleInfo={{ book, chapter, article }}>
            <Button variant="ghost" size="icon" title="Print">
              <Printer className="h-5 w-5" />
            </Button>
          </PrintDialog>
        </div>
      </div>
    </header>
  );
}
