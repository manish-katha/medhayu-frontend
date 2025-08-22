
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Book, BookContent, Chapter, Article, GlossaryTerm, Bookmark, BookTheme, GlossaryCategory, ContentBlock, QuoteCategory, Quote } from '@/types';
import { useBookTheme } from '@/components/theme/BookThemeContext';
import { Loader2, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { ThemeApplier } from '@/components/theme/ThemeApplier';
import { TextSelectionMenu } from '@/components/medhayu/Article renderer/text-selection-menu';
import { UserCitationDialog } from '@/components/medhayu/Article renderer/user-citation-dialog';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { CommentFormDialog } from '@/components/medhayu/Article renderer/comment-form-dialog';
import { PublicArticleRenderer } from '@/components/medhayu/Article renderer/public-article-renderer';
import { ArticleMetadataBar } from '@/components/medhayu/Article renderer/article-metadata-bar';
import { LivingDocumentSidebar } from '@/components/medhayu/living-document/living-document-sidebar';
import { getQuoteData } from '@/services/quote.service';
import { getBookmarksForUser } from '@/services/user.service';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { getIastLabelById, getSanskritLabelById, ALL_COMMENTARY_TYPES } from '@/types/sanskrit.types';
import { Transliterate } from '@/components/transliteration-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NoteDialog } from '@/components/medhayu/Article renderer/interaction-dialogs';
import RequestManthanaDialog from '@/components/discussions/RequestManthanaDialog';
import { addPost } from '@/services/post.service';
import { useToast } from '@/hooks/use-toast';
import { ShareWorkDialog } from '@/components/medhayu/wall/ShareWorkDialog';

interface ArticlePageUIProps {
    books: Book[];
    book: BookContent | null;
    chapter: Chapter | null;
    article: Article | null;
    prevArticle: Article | null;
    nextArticle: Article | null;
    glossary: GlossaryTerm[];
    bookmarks: Bookmark[];
    selectedBookId: string | null;
    activeGlossary: GlossaryCategory | null;
    onSelectBook: (bookId: string) => void;
    onSelectUnit: (chapter: Chapter, article: Article) => void;
    onPrev: () => void;
    onNext: () => void;
    isLoading: boolean;
    onActiveGlossaryChange: (glossary: GlossaryCategory | null) => void;
}

const ContentPane: React.FC<{
  blocksToRender: ContentBlock[];
  fontSize: number;
  articleInfo: { book: BookContent; chapter: Chapter; article: Article; };
  isGlossaryMode: boolean;
  glossary: GlossaryTerm[];
  bookmarks: Bookmark[];
  activeGlossaryColor?: string;
  highlightTarget: string | null;
  onHighlight: (id: string) => void;
  title: string;
  allChoices: { id: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  onSelectText: (text: string) => void;
  onSaveCitation: () => void;
  onAddComment: () => void;
  onCreateQuote: () => void;
  onAddNote: () => void;
  onRequestManthana: () => void;
  onPostToWall: (text: string) => void;
}> = (props) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <PaneSelector
                    choices={props.allChoices}
                    selectedValue={props.selectedValue}
                    onSelect={props.onValueChange}
                    title={props.title}
                />
            </div>
            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 themed-content-area" style={{ fontSize: `${props.fontSize}px` }}>
                    <TextSelectionMenu 
                        onSelectText={props.onSelectText}
                        onSaveCitation={props.onSaveCitation}
                        onCreateQuote={props.onCreateQuote}
                        onAddComment={props.onAddComment}
                        onAddNote={props.onAddNote}
                        onRequestManthana={props.onRequestManthana}
                        onPostToWall={props.onPostToWall}
                    >
                        <div className="printable-content prose-styling">
                            <PublicArticleRenderer 
                                blocks={props.blocksToRender}
                                bookmarks={props.bookmarks}
                                articleInfo={props.articleInfo!}
                                highlightTarget={props.highlightTarget}
                                onHighlight={props.onHighlight}
                                isGlossaryMode={props.isGlossaryMode}
                                glossary={props.glossary}
                                activeGlossaryColor={props.activeGlossaryColor}
                                hideNotes={true} // Notes will be handled at page level
                            />
                        </div>
                    </TextSelectionMenu>
                </div>
            </ScrollArea>
        </div>
    )
}

const PaneSelector: React.FC<{
  choices: { id: string; label: string }[];
  selectedValue: string;
  onSelect: (id: string) => void;
  title: string;
}> = ({ choices, selectedValue, onSelect, title }) => {
  const selectedLabel = choices.find(c => c.id === selectedValue)?.label || 'Select...';

  return (
    <div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between font-semibold">
                <span className="truncate"><Transliterate>{selectedLabel}</Transliterate></span>
                <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {choices.map((choice) => (
                <DropdownMenuItem key={choice.id} onSelect={() => onSelect(choice.id)}>
                    <Transliterate>{choice.label}</Transliterate>
                </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
};


export function ArticlePageUI({
    books,
    book,
    chapter,
    article,
    prevArticle,
    nextArticle,
    glossary,
    bookmarks: initialBookmarks,
    selectedBookId,
    activeGlossary,
    onSelectBook,
    onSelectUnit,
    onPrev,
    onNext,
    isLoading,
    onActiveGlossaryChange,
}: ArticlePageUIProps) {
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    
    const [layout, setLayout] = useState<'single' | 'two' | 'three'>('single');
    const [fontSize, setFontSize] = useState(18);

    const [selectedText, setSelectedText] = useState('');
    const [isCitationDialogOpen, setIsCitationDialogOpen] = useState(false);
    const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [isManthanaDialogOpen, setIsManthanaDialogOpen] = useState(false);
    const [quoteCategories, setQuoteCategories] = useState<QuoteCategory[]>([]);
    const [highlightTarget, setHighlightTarget] = useState<string | null>(null);
    const [paneContents, setPaneContents] = useState<[string, string, string]>(['mula', 'commentary-0', 'commentary-1']);
    
    const [isShareWorkOpen, setIsShareWorkOpen] = useState(false);
    const [isShareTextSnippetOpen, setIsShareTextSnippetOpen] = useState(false);
    const [textSnippet, setTextSnippet] = useState('');

    const { theme: activeTheme } = useBookTheme();

    const bookInfo = useMemo(() => {
        if (!book || !article || !chapter) return null;
        return { book, chapter, article };
      }, [book, chapter, article]);
    
    const isArticleBookmarked = useMemo(() => {
        if (!bookInfo) return false;
        return bookmarks.some(b => 
            b.type === 'article' && 
            b.bookId === bookInfo.book.bookId && 
            String(b.chapterId) === String(chapter.id) && 
            String(b.verse) === String(article.verse)
        );
    }, [bookmarks, bookInfo, chapter, article]);

     useEffect(() => {
        getQuoteData().then(setQuoteCategories);
        getBookmarksForUser('default-user').then(setBookmarks);
    }, [book?.bookId, chapter?.id, article?.verse]);

    const handleTextSelection = useCallback((text: string) => {
        if (text) setSelectedText(text);
    }, []);

    const handleSaveCitation = () => setIsCitationDialogOpen(true);
    const handleCreateQuote = () => setIsQuoteDialogOpen(true);
    const handleAddComment = () => setIsCommentDialogOpen(true);
    const handleAddNote = () => setIsNoteDialogOpen(true);
    const handleRequestManthana = () => setIsManthanaDialogOpen(true);
    
    const handlePostToWall = (text: string) => {
        setTextSnippet(text);
        setIsShareTextSnippetOpen(true);
    };

    const handleQuoteCreated = (newQuote?: Quote) => {
        toast({ title: 'Quote Created!', description: 'Your new quote has been saved to the library.' });
    }
    
    const onHighlight = (id: string) => {
        setHighlightTarget(id);
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightTarget(null), 1200);
    };

     const { sourceBlocks, commentaryChoices, contentMap } = useMemo(() => {
      if (!article) return { sourceBlocks: [], commentaryChoices: [], contentMap: new Map() };
      
      const sourceBlocks: ContentBlock[] = [];
      const commentaryChoices: { id: string; label: string }[] = [];
      const contentMap = new Map<string, ContentBlock[]>();

      contentMap.set('mula', []);

      let commentaryIndex = 0;
      for (const block of article.content) {
        if (!ALL_COMMENTARY_TYPES.includes(block.type)) {
          sourceBlocks.push(block);
          (contentMap.get('mula') as ContentBlock[]).push(block);
        } else {
          const commentaryId = `commentary-${commentaryIndex}`;
          if (!commentaryChoices.some(c => c.label === (block.commentary?.shortName || `Commentary ${commentaryIndex + 1}`))) {
            commentaryChoices.push({ id: commentaryId, label: block.commentary?.shortName || `Commentary ${commentaryIndex + 1}`});
          }
          if (!contentMap.has(commentaryId)) {
            contentMap.set(commentaryId, []);
          }
          (contentMap.get(commentaryId) as ContentBlock[]).push(block);
          commentaryIndex++;
        }
      }
      return { sourceBlocks, commentaryChoices, contentMap };
    }, [article]);
    
    const allPaneChoices = useMemo(() => [{ id: 'mula', label: 'Mula (Source)' }, ...commentaryChoices], [commentaryChoices]);
    
    useEffect(() => {
      // Reset selections when article changes
      const commentaryKeys = commentaryChoices.map(c => c.id);
      setPaneContents(['mula', commentaryKeys[0] || 'commentary-0', commentaryKeys[1] || 'commentary-1']);
    }, [article, commentaryChoices]);

    
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        )
    }
    
    const sidebarProps = {
        books,
        selectedBookId,
        onSelectBook,
        bookContent: book,
        onSelectUnit: (ch: Chapter, art: Article) => {
            onSelectUnit(ch, art);
            if(isMobile) setIsSidebarSheetOpen(false);
        },
        search,
        setSearch,
        isLoading,
        selectedUnit: article,
        activeGlossary,
        onActiveGlossaryChange,
        layout,
        onLayoutChange: setLayout,
        fontSize,
        onFontSizeChange: setFontSize,
        articleInfo: bookInfo,
        isArticleBookmarked,
        onHighlight: onHighlight,
        onClose: () => setIsSidebarSheetOpen(false),
        tocContentHtml: article?.content.map(b => b.sanskrit).join('') || '',
    };
    
    const mainContentProps = {
        isGlossaryMode: activeGlossary !== null,
        glossary: glossary,
        activeGlossaryColor: activeGlossary?.colorTheme,
        bookmarks,
        articleInfo: bookInfo!,
        highlightTarget,
        onHighlight,
        onSelectText: handleTextSelection,
        onSaveCitation: handleSaveCitation,
        onAddComment: handleAddComment,
        onCreateQuote: handleCreateQuote,
        onAddNote: handleAddNote,
        onRequestManthana: handleRequestManthana,
        onPostToWall: handlePostToWall,
    }

    const MainContent = () => (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden" id="reader-content-area">
            {bookInfo ? (
                <>
                   {layout === 'single' && (
                       <ContentPane 
                            allChoices={allPaneChoices}
                            selectedValue={paneContents[0]}
                            onValueChange={(val) => setPaneContents([val, paneContents[1], paneContents[2]])}
                            blocksToRender={contentMap.get(paneContents[0]) || []}
                            {...mainContentProps}
                            title="Showing"
                            fontSize={fontSize}
                       />
                   )}
                   
                   {layout === 'two' && (
                       <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={50}>
                                 <ContentPane 
                                    allChoices={allPaneChoices}
                                    selectedValue={paneContents[0]}
                                    onValueChange={(val) => setPaneContents([val, paneContents[1], paneContents[2]])}
                                    blocksToRender={contentMap.get(paneContents[0]) || []}
                                    {...mainContentProps}
                                    title="Left Pane"
                                    fontSize={fontSize}
                                />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50}>
                               <ContentPane 
                                    allChoices={allPaneChoices}
                                    selectedValue={paneContents[1]}
                                    onValueChange={(val) => setPaneContents([paneContents[0], val, paneContents[2]])}
                                    blocksToRender={contentMap.get(paneContents[1]) || []}
                                    {...mainContentProps}
                                    title="Right Pane"
                                    fontSize={fontSize}
                                />
                            </ResizablePanel>
                       </ResizablePanelGroup>
                   )}
                   {layout === 'three' && (
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={34}>
                                 <ContentPane 
                                    allChoices={allPaneChoices}
                                    selectedValue={paneContents[0]}
                                    onValueChange={(val) => setPaneContents([val, paneContents[1], paneContents[2]])}
                                    blocksToRender={contentMap.get(paneContents[0]) || []}
                                    {...mainContentProps}
                                    title="Pane 1"
                                    fontSize={fontSize}
                                />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={33}>
                               <ContentPane 
                                    allChoices={allPaneChoices}
                                    selectedValue={paneContents[1]}
                                    onValueChange={(val) => setPaneContents([paneContents[0], val, paneContents[2]])}
                                    blocksToRender={contentMap.get(paneContents[1]) || []}
                                    {...mainContentProps}
                                    title="Pane 2"
                                    fontSize={fontSize}
                                />
                            </ResizablePanel>
                             <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={33}>
                                <ContentPane 
                                    allChoices={allPaneChoices}
                                    selectedValue={paneContents[2]}
                                    onValueChange={(val) => setPaneContents([paneContents[0], paneContents[1], val])}
                                    blocksToRender={contentMap.get(paneContents[2]) || []}
                                    {...mainContentProps}
                                    title="Pane 3"
                                    fontSize={fontSize}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                   )}

                    <footer className="container mx-auto max-w-4xl px-4 py-4 no-print sticky bottom-0 bg-background/80 backdrop-blur-sm border-t">
                        <div className="flex justify-between items-center">
                            {prevArticle ? (
                                <Button variant="outline" onClick={onPrev}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                            ) : <div />}
                            {nextArticle ? (
                                <Button variant="outline" onClick={onNext}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : <div />}
                        </div>
                    </footer>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <h2 className="text-2xl font-bold">Select a Book to Read</h2>
                    <p className="text-muted-foreground max-w-md">
                        Choose a book from the dropdown to begin your Svadhyaya (self-study).
                    </p>
                </div>
            )}
        </main>
    );

    return (
        <>
        {bookInfo && (
            <>
                <UserCitationDialog
                    open={isCitationDialogOpen}
                    onOpenChange={setIsCitationDialogOpen}
                    sanskritText={selectedText}
                    source={{ name: bookInfo.book.bookName, location: `${bookInfo.chapter.name} - ${bookInfo.article.verse}`}}
                />
                <CreateQuoteDialog
                    open={isQuoteDialogOpen}
                    onOpenChange={setIsQuoteDialogOpen}
                    categories={quoteCategories}
                    initialQuote={selectedText}
                    onQuoteCreated={handleQuoteCreated}
                />
                <CommentFormDialog
                    open={isCommentDialogOpen}
                    onOpenChange={setIsCommentDialogOpen}
                    targetText={selectedText}
                    articleInfo={{ bookId: book.bookId, chapterId: String(chapter.id), verse: String(article.verse) }}
                />
                 <NoteDialog
                    open={isNoteDialogOpen}
                    onOpenChange={setIsNoteDialogOpen}
                    articleInfo={bookInfo}
                    block={{sanskrit: selectedText, id: 'selection'} as any}
                />
                 <RequestManthanaDialog
                    open={isManthanaDialogOpen}
                    onOpenChange={setIsManthanaDialogOpen}
                    discussionId={`article-${bookInfo.article.id || bookInfo.article.verse}`}
                    initialPurvapaksha={selectedText}
                 />
                 <ShareWorkDialog
                    open={isShareTextSnippetOpen}
                    onOpenChange={setIsShareTextSnippetOpen}
                    onPostCreated={() => {}}
                    userCircles={[]}
                    workHtmlContent={textSnippet}
                    isTextSnippet={true}
                />
            </>
        )}
        <div className="h-screen w-full flex flex-col overflow-hidden">
            {activeTheme && <ThemeApplier theme={activeTheme} />}
            {bookInfo && (
                 <div className="sticky top-0 z-30 no-print container mx-auto max-w-4xl px-4">
                    <ArticleMetadataBar articleInfo={bookInfo} />
                </div>
            )}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                <MainContent />
                {isMobile ? (
                    <Sheet open={isSidebarSheetOpen} onOpenChange={setIsSidebarSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg no-print" size="icon">
                                <PanelLeft className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] p-0">
                            <LivingDocumentSidebar {...sidebarProps} bookContent={book} />
                        </SheetContent>
                    </Sheet>
                ) : (
                    <LivingDocumentSidebar {...sidebarProps} bookContent={book} />
                )}
            </div>
        </div>
        </>
    )
}
