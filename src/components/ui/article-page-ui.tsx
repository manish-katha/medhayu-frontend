
'use client';

import React, { useState, useMemo, useEffect, useCallback, useActionState } from 'react';
import Link from 'next/link';
import {
  type BookContent,
  type Chapter,
  type Article,
  type ContentBlock,
  type GlossaryTerm,
  type Bookmark,
  type QuoteCategory,
} from '@/types';
import { getBookmarksForUser } from '@/services/user.service';
import { getQuoteData } from '@/services/quote.service';
import { PublicArticleRenderer } from '@/components/public-article-renderer';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Menu,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { handleArticleFeedback } from '@/app/articles/actions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TextSelectionMenu } from './text-selection-menu';
import { UserCitationDialog } from './user-citation-dialog';
import { CommentFormDialog } from './comment-form-dialog';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { ArticleComments } from './article-comments';
import { cn } from '@/lib/utils';
import { LivingDocumentSidebar } from '@/components/admin/living-document/living-document-sidebar';
import { ReaderHeader } from './reader-header';
import { ArticleMetadataBar } from './article-metadata-bar';
import { useBookTheme } from './theme/BookThemeContext';
import { ThemeApplier } from './theme/ThemeApplier';

export function ArticlePageUI({
  book,
  chapter,
  article,
  prevArticle,
  nextArticle,
  glossary,
}: {
  book: BookContent;
  chapter: Chapter;
  article: Article;
  prevArticle: Article | null;
  nextArticle: Article | null;
  glossary: GlossaryTerm[];
}) {
    const { theme } = useBookTheme();
    
    // Interaction states
    const [selectedText, setSelectedText] = useState('');
    const [isCitationDialogOpen, setIsCitationDialogOpen] = useState(false);
    const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [quoteCategories, setQuoteCategories] = useState<QuoteCategory[]>([]);


    const [feedbackState, formAction] = useActionState(handleArticleFeedback, null);
    const { toast } = useToast();
    const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, boolean>>({});

    const bookInfo = useMemo(() => ({ book, chapter, article }), [book, chapter, article]);

    useEffect(() => {
        getQuoteData().then(setQuoteCategories);
        getBookmarksForUser('default-user').then(setBookmarks);
    }, [book.bookId, chapter.id, article.verse]);

  useEffect(() => {
    if (feedbackState?.success) {
      toast({ title: 'Feedback Received', description: 'Thank you for your input!' });
    }
    if (feedbackState?.error) {
      toast({ variant: 'destructive', title: 'Error', description: feedbackState.error });
    }
  }, [feedbackState, toast]);

  const onFeedbackSubmit = (formData: FormData) => {
    const action = formData.get('action');
    const score = formData.get('score');

    if (action) {
        setSubmittedFeedback(prev => ({ ...prev, like_dislike: true }));
    }
    if (score) {
        setSubmittedFeedback(prev => ({ ...prev, score: true }));
    }
    formAction(formData);
  };
  
  const handleTextSelection = useCallback((text: string) => {
    if (text) {
      setSelectedText(text);
    }
  }, []);

  const handleSaveCitation = () => setIsCitationDialogOpen(true);
  const handleCreateQuote = () => setIsQuoteDialogOpen(true);
  const handleAddComment = () => setIsCommentDialogOpen(true);
  
  return (
    <>
      <ThemeApplier theme={theme} />
      <UserCitationDialog
        open={isCitationDialogOpen}
        onOpenChange={setIsCitationDialogOpen}
        sanskritText={selectedText}
        source={{ name: book.bookName, location: `${chapter.name} - ${article.verse}`}}
      />
       <CreateQuoteDialog
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          categories={quoteCategories}
          initialQuote={selectedText}
        />
      <CommentFormDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        targetText={selectedText}
        articleInfo={{ bookId: book.bookId, chapterId: String(chapter.id), verse: String(article.verse) }}
      />
      <div className="flex flex-col min-h-screen relative bg-body-bg-color">
        <ReaderHeader
          book={book}
          chapter={chapter}
          article={article}
          isArticleBookmarked={bookmarks.some(b => b.type === 'article' && b.bookId === book.bookId && String(b.chapterId) === String(chapter.id) && String(b.verse) === String(article.verse))}
        />
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-40 no-print">
          <Link href="/" passHref>
            <Button variant="outline">
              <Home className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Home</span>
            </Button>
          </Link>
        </div>

        <div className="container mx-auto max-w-4xl px-4 sticky top-16 z-20 no-print">
          <ArticleMetadataBar
            articleInfo={{ book, chapter, article }}
            className="mt-4"
          />
        </div>
        
        <main className="container mx-auto py-12 px-4 flex-1 min-w-0 max-w-4xl">
          <TextSelectionMenu 
              onSelectText={handleTextSelection}
              onSaveCitation={handleSaveCitation}
              onAddComment={handleAddComment}
              onCreateQuote={handleCreateQuote}
          >
            <div className="printable-content">
               <PublicArticleRenderer 
                  blocks={article.content}
                  bookmarks={bookmarks}
                  articleInfo={bookInfo}
              />
            </div>
          </TextSelectionMenu>
          
            <ArticleComments articleId={String(article.verse)} bookId={book.bookId} chapterId={String(chapter.id)} comments={article.comments || []} />
            <Card className="mt-12 no-print">
                <CardHeader>
                    <CardTitle>Was this article helpful?</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={onFeedbackSubmit} className="space-y-8">
                        <input type="hidden" name="bookId" value={book.bookId} />
                        <input type="hidden" name="chapterId" value={String(chapter.id)} />
                        <input type="hidden" name="verse" value={String(article.verse)} />

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Button type="submit" name="action" value="like" variant="outline" disabled={submittedFeedback['like_dislike']}>
                            <ArrowUp className="mr-2 h-4 w-4" /> Upvote {article.feedback?.likes ?? 0}
                            </Button>
                            <Button type="submit" name="action" value="dislike" variant="outline" disabled={submittedFeedback['like_dislike']}>
                            <ArrowDown className="mr-2 h-4 w-4" /> Downvote {article.feedback?.dislikes ?? 0}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <footer className="container mx-auto max-w-4xl px-4 py-8 no-print">
                <Separator />
                <div className="flex justify-between items-center pt-8">
                    {prevArticle ? (
                        <Button asChild variant="outline">
                            <Link href={`/articles/${book.bookId}/${chapter.id}/${prevArticle.verse}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Link>
                        </Button>
                    ) : <div />}
                    {nextArticle ? (
                        <Button asChild variant="outline">
                            <Link href={`/articles/${book.bookId}/${chapter.id}/${nextArticle.verse}`}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : <div />}
                </div>
            </footer>
        </main>
      </div>
    </>
  );
}
