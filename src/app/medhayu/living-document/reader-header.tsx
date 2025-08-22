
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { BookmarkButton } from '@/components/medhayu/Article renderer/bookmark-button';
import type { BookContent, Chapter, Article } from '@/types';

interface ReaderHeaderProps {
    book: BookContent;
    chapter: Chapter;
    article: Article;
    isArticleBookmarked: boolean;
    onTocOpen?: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    onSettingsOpen?: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
    book,
    chapter,
    article,
    isArticleBookmarked,
    onTocOpen,
    onPrev,
    onNext,
    onSettingsOpen
}) => {
    return (
        <header className="flex items-center justify-between p-2 border-b h-16 flex-shrink-0 no-print">
            <div className="flex items-center gap-2">
                {onTocOpen && (
                    <Button variant="outline" size="icon" className="md:hidden" onClick={onTocOpen}>
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
                {onPrev && <Button variant="ghost" size="icon" onClick={onPrev}><ChevronLeft className="h-5 w-5" /></Button>}
                {onNext && <Button variant="ghost" size="icon" onClick={onNext}><ChevronRight className="h-5 w-5" /></Button>}
            </div>
            
            <div className="flex-1 px-4 text-center truncate">
                <span className="text-sm font-medium">{chapter.name} - {article.title}</span>
            </div>

            <div className="flex items-center gap-2">
                <form action={() => {}}>
                    <BookmarkButton
                        isBookmarked={isArticleBookmarked}
                        type="article"
                        book={book}
                        chapter={chapter}
                        article={article}
                        size="icon"
                    />
                </form>
                {onSettingsOpen && (
                    <Button variant="ghost" size="icon" title="View Settings" onClick={onSettingsOpen}>
                        <Settings className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </header>
    );
};
