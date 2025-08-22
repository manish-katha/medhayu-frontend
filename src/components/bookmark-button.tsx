
'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Article, BookContent, Chapter } from '@/types';

interface BookmarkButtonProps extends Omit<ButtonProps, 'type' | 'disabled' | 'children'> {
  isBookmarked: boolean;
  type: 'article' | 'block';
  book: BookContent;
  chapter: Chapter;
  article: Article;
}

export function BookmarkButton({
  isBookmarked,
  type,
  book,
  chapter,
  article,
  ...props
}: BookmarkButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" disabled={pending} {...props}>
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Bookmark
          className={cn(
            'h-5 w-5 transition-colors',
            isBookmarked
              ? 'fill-amber-400 text-amber-500'
              : 'text-muted-foreground hover:text-foreground'
          )}
        />
      )}
    </Button>
  );
}
