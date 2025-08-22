
'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleToggleBookmark } from '@/app/articles/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Bookmark, Article, ContentBlock, Chapter, BookContent } from '@/lib/data-service';

type BookmarkButtonProps = {
    isBookmarked: boolean;
    type: 'article' | 'block';
    book: BookContent;
    chapter: Chapter;
    article: Article;
    block?: ContentBlock;
    className?: string;
    size?: 'default' | 'sm' | 'icon';
};

function SubmitButton({ isBookmarked, size }: { isBookmarked: boolean, size?: 'default' | 'sm' | 'icon' }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="ghost" size={size || "icon"} disabled={pending} title={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
            <BookmarkIcon className={cn("h-5 w-5", isBookmarked && "fill-primary text-primary")} />
        </Button>
    )
}

export function BookmarkButton({ isBookmarked, type, book, chapter, article, block, className, size }: BookmarkButtonProps) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(handleToggleBookmark, null);
    const [optimisticIsBookmarked, setOptimisticIsBookmarked] = useState(isBookmarked);

    useEffect(() => {
        setOptimisticIsBookmarked(isBookmarked);
    }, [isBookmarked]);
    
    useEffect(() => {
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
            // Revert optimistic update on error
            setOptimisticIsBookmarked(isBookmarked);
        }
         if (state?.success) {
            toast({ title: state.message });
        }
    }, [state, toast, isBookmarked]);

    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';
    const blockTextPreview = block ? stripHtml(block.sanskrit).substring(0, 100) : undefined;
    
    const handleFormAction = (formData: FormData) => {
        setOptimisticIsBookmarked(prev => !prev);
        formAction(formData);
    }
    
    return (
        <form action={handleFormAction} className={className}>
            <input type="hidden" name="userId" value="default-user" />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="bookId" value={book?.bookId || ''} />
            <input type="hidden" name="chapterId" value={String(chapter?.id || '')} />
            <input type="hidden" name="verse" value={String(article?.verse || '')} />
            {block && <input type="hidden" name="blockId" value={block.id} />}
            <input type="hidden" name="bookName" value={book?.bookName || ''} />
            <input type="hidden" name="articleTitle" value={article?.title || ''} />
            {blockTextPreview && <input type="hidden" name="blockTextPreview" value={blockTextPreview} />}
            <SubmitButton isBookmarked={optimisticIsBookmarked} size={size} />
        </form>
    );
}
