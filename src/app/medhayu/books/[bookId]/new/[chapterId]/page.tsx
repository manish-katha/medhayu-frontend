
'use client';

import React, { useActionState, useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import type { Editor, Range } from '@tiptap/react';

import { getBookContent as getBookContentData } from '@/services/book.service';
import { getQuoteData } from '@/services/quote.service';
import { createArticle } from '@/actions/book.actions';
import { type ContentBlock, type BookContent, type Chapter, type Quote, type QuoteCategory, type GlossaryCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditorNotesDisplay } from '@/components/admin/editor/notes-display';
import { AddBlockDialog, CommentaryDialog, SourceInfoDialog } from '@/components/admin/book-forms';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Save, ArrowLeft, Trash2, Plus, Eye, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { ALL_COMMENTARY_TYPES, getTypeLabelById, getSanskritLabelById, ALL_SOURCE_TYPES, getIastLabelById } from '@/types/sanskrit.types';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArticleRenderer } from '@/components/article-renderer';
import dynamic from 'next/dynamic';
import { IntellicitePanel } from '@/components/admin/intellicite-panel';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Transliterate } from '@/components/transliteration-provider';
import { CommentFormDialog } from '@/components/medhayu/Article renderer/comment-form-dialog';
import { BookThemeProvider } from '@/components/theme/BookThemeContext';
import { getThemeForBook, getDefaultTheme } from '@/services/theme.service';
import { type BookTheme } from '@/types';
import { EditorToolbar } from '@/components/admin/editor/toolbar';

const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor'), {
    ssr: false,
    loading: () => <div className="prose-styling min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 animate-pulse" />
});

type CreateArticleState = {
    error?: string;
    fieldErrors?: any;
    success?: boolean;
    redirectPath?: string;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {children}
        </Button>
    );
}

function CreateArticlePageContent({ bookData, chapterData }: { bookData: BookContent; chapterData: Chapter; }) {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const bookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const [verse, setVerse] = useState('');
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<Partial<ContentBlock>[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [activeEditorBlockId, setActiveEditorBlockId] = useState<string | null>(null);
    const [editorInstances, setEditorInstances] = useState<Map<string, Editor>>(new Map());

    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [dialogState, setDialogState] = useState<{ type: 'commentary' | 'source' | null, blockId: string | null }>({ type: null, blockId: null });
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeGlossary, setActiveGlossary] = useState<GlossaryCategory | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [quoteCategories, setQuoteCategories] = React.useState<QuoteCategory[]>([]);
    const [quoteDialogState, setQuoteDialogState] = React.useState<{ open: boolean; text: string; range: Range | null }>({ open: false, text: '', range: null });

    const [commentDialogState, setCommentDialogState] = React.useState<{ open: boolean; text: string; }>({ open: false, text: '' });
    const [highlightTarget, setHighlightTarget] = useState<string | null>(null);
    
    const [state, formAction] = useActionState<CreateArticleState, FormData>(createArticle, {});
    
    const POETIC_TYPES = ['shloka', 'sutra', 'padya', 'richa', 'mantra', 'upanishad'];

     useEffect(() => {
        getQuoteData().then(setQuoteCategories);
    }, []);

    useEffect(() => {
        if (chapterData) {
            const nextArticleNumber = (chapterData.articles?.length || 0) + 1;
            setVerse(String(nextArticleNumber));
            setTitle(`Article ${nextArticleNumber}`);
        }
    }, [chapterData]);

    useEffect(() => {
        if (state?.success && state.redirectPath) {
            toast({ title: "Success!", description: "Article created successfully." });
            router.push(state.redirectPath);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Creation Failed", description: state.error });
        }
    }, [state, toast, router]);
    
    const updateBlock = useCallback((id: string, updates: Partial<Omit<ContentBlock, 'id'>>) => {
        setBlocks(currentBlocks =>
          currentBlocks.map(block =>
            block?.id === id ? { ...block, ...updates } : block
          )
        );
    }, []);

    const addBlock = useCallback((type: string) => {
        const newBlock: Partial<ContentBlock> = {
          id: crypto.randomUUID(),
          sanskrit: '',
          type,
        };
        setBlocks(currentBlocks => [...currentBlocks, newBlock]);
        
        const isCommentary = ALL_COMMENTARY_TYPES.includes(type);
        if (isCommentary) {
            setTimeout(() => setDialogState({ type: 'commentary', blockId: newBlock.id! }), 0);
        } else {
             setTimeout(() => setDialogState({ type: 'source', blockId: newBlock.id! }), 0);
        }
        setActiveEditorBlockId(newBlock.id!);
        setTimeout(() => {
          const editorInstance = editorInstances.get(newBlock.id!);
          editorInstance?.commands.focus();
        }, 100);
    }, [editorInstances]);
    
    const removeBlock = useCallback((id: string) => {
        setBlocks(currentBlocks => currentBlocks.filter(block => block?.id !== id));
    }, []);

    const setEditorInstance = useCallback((id: string, editor: Editor) => {
        setEditorInstances(prev => new Map(prev).set(id, editor));
    }, []);

    const removeEditorInstance = useCallback((id: string) => {
        setEditorInstances(prev => {
            const newMap = new Map(prev);
            const editorToDestroy = newMap.get(id);
            if(editorToDestroy && !editorToDestroy.isDestroyed) {
                editorToDestroy.destroy();
            }
            newMap.delete(id);
            return newMap;
        });
    }, []);

    const handleClearBlocks = () => {
        setBlocks([]);
        setIsClearConfirmOpen(false);
    };

    const handleNewQuoteFound = useCallback((text: string, range: Range) => {
        setQuoteDialogState({ open: true, text, range });
    }, []);

    const handleAddComment = useCallback((text: string) => {
        setCommentDialogState({ open: true, text });
    }, []);

    const handleQuoteCreated = React.useCallback((newQuote?: Quote) => {
      // This part requires an active editor instance. 
      // It might need to be refactored if we manage editors centrally.
    }, []);

    const handleHighlight = (id: string) => {
        setHighlightTarget(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => setHighlightTarget(null), 1200);
    };

    const blockToEditForDialog = dialogState.blockId ? blocks.find(b => b?.id === dialogState.blockId) : null;
    
    const activeEditorInstance = activeEditorBlockId ? editorInstances.get(activeEditorBlockId) : null;

    const panelContent = (
        <IntellicitePanel 
            tags={tags} 
            onTagsChange={setTags} 
            editor={activeEditorInstance}
            blocks={blocks}
            activeGlossary={activeGlossary}
            onActiveGlossaryChange={setActiveGlossary}
            articleInfo={null} // no article info for new articles
            onHighlight={handleHighlight}
            headerActions={
                <div className="flex w-full items-center justify-end gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" type="button"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-4xl">
                            <SheetHeader>
                                <SheetTitle>Article Preview</SheetTitle>
                                <SheetDescription>{chapterData.name}, Verse {verse}</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-4 note-editor">
                                    <ArticleRenderer blocks={blocks.map(b => ({...b, id: b!.id || '', sanskrit: b!.sanskrit || '', type: b!.type || 'shloka'})) as ContentBlock[]} />
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="sm" type="button" onClick={() => router.push(`/medhayu/books/${bookId}`)}>Cancel</Button>
                    <SubmitButton>Create Article</SubmitButton>
                 </div>
            }
        />
    );


    return (
        <div className="h-screen flex flex-col bg-muted/40">
            <CreateQuoteDialog
                open={quoteDialogState.open}
                onOpenChange={(isOpen) => setQuoteDialogState(prev => ({ ...prev, open: isOpen }))}
                initialQuote={quoteDialogState.text || ''}
                onQuoteCreated={handleQuoteCreated}
                categories={quoteCategories}
            />
             <CommentFormDialog
                open={commentDialogState.open}
                onOpenChange={(isOpen) => setCommentDialogState(prev => ({...prev, open: isOpen}))}
                targetText={commentDialogState.text}
                articleInfo={{ bookId, chapterId, verse: String(verse) }}
            />
             <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently remove all content blocks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearBlocks} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Yes, Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {blockToEditForDialog && (
              <>
                <CommentaryDialog
                    open={dialogState.type === 'commentary'}
                    onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, blockId: null })}
                    initialData={blockToEditForDialog?.commentary || { type: blockToEditForDialog?.type || 'bhashya', author: '', workName: '', shortName: ''}}
                    onSave={(data) => {
                        if (dialogState.blockId) {
                            updateBlock(dialogState.blockId, { type: data.type, commentary: data });
                        }
                        setDialogState({ type: null, blockId: null });
                    }}
                />
                <SourceInfoDialog
                    open={dialogState.type === 'source'}
                    onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, blockId: null })}
                    blockType={blockToEditForDialog?.type || 'shloka'}
                />
              </>
            )}
            <form action={formAction} className="flex-1 flex flex-col min-h-0">
                <input type="hidden" name="bookId" value={bookId} />
                <input type="hidden" name="chapterId" value={chapterId} />
                <input type="hidden" name="verse" value={verse} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="content" value={JSON.stringify(blocks)} />
                <input type="hidden" name="tags" value={JSON.stringify(tags)} />

                <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-20">
                     <div className="flex-1 min-w-0">
                         <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                            <Link href={`/medhayu/books/${bookId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to {bookData.bookName}</Link>
                        </Button>
                    </div>
                     <div className="flex items-center gap-2">
                         {isMobile && (
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon"><Menu className="h-4 w-4" /></Button>
                                </SheetTrigger>
                                <SheetContent className="w-[340px] p-0 flex flex-col">
                                    {panelContent}
                                </SheetContent>
                            </Sheet>
                         )}
                     </div>
                </header>

                <div className="flex-1 flex flex-row overflow-hidden">
                    <main className="flex-1 flex flex-col overflow-hidden bg-muted/40">
                         {activeEditorInstance && (
                            <div className="editor-toolbar-container flex-shrink-0 border-b z-10 bg-background/95 backdrop-blur-sm">
                                <EditorToolbar editor={activeEditorInstance} />
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-8 sm:p-12 bg-card note-editor note-context clearfix w-full">
                                <div className="flex justify-between items-start mb-6 border-b pb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold font-headline">{title}</h1>
                                        <h2 className="text-xl text-muted-foreground font-headline">
                                            {chapterData.name}, Verse {verse}
                                        </h2>
                                    </div>
                                    {blocks.length > 0 && (
                                        <Button type="button" variant="destructive" size="sm" onClick={() => setIsClearConfirmOpen(true)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Clear All
                                        </Button>
                                    )}
                                </div>
                                <div className="article-editor-content prose-styling">
                                    {blocks.length > 0 ? (
                                        blocks.map((block, index) => {
                                            if (!block || !block.id) return null;
                                            const prevBlock = index > 0 ? blocks[index - 1] : null;
                                            const isCommentary = ALL_COMMENTARY_TYPES.includes(block!.type!);
                                            const isSource = ALL_SOURCE_TYPES.includes(block!.type!);
                                            const useTightSpacing = prevBlock && POETIC_TYPES.includes(block!.type!) && POETIC_TYPES.includes(prevBlock!.type!);
                                            return (
                                                <React.Fragment key={block.id}>
                                                    {index > 0 && <Separator className={useTightSpacing ? "my-1" : "my-6"} />}
                                                     <div className={cn("article-editor-block relative group", activeEditorBlockId === block.id && "bg-muted/30 rounded-md", highlightTarget === block.id && 'highlight-flash')} id={block.id}>
                                                         <div className="flex flex-col">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div 
                                                                    className="flex-1 cursor-pointer"
                                                                    onClick={() => {
                                                                        const type = getCategoryForType(block.type);
                                                                        setDialogState({ type, blockId: block.id! });
                                                                    }}
                                                                >
                                                                    {isCommentary ? (
                                                                        <div className="font-bold text-xl text-primary/80 font-headline hover:bg-muted p-2 rounded-md -ml-2">
                                                                            <Transliterate>
                                                                                {block!.commentary ? (
                                                                                    <>{block!.commentary.shortName} - {getSanskritLabelById(block!.type!)}</>
                                                                                ) : (
                                                                                    <>Add details for: {getSanskritLabelById(block!.type!)}...</>
                                                                                )}
                                                                            </Transliterate>
                                                                            <span className="inline-block h-0.5 w-[8%] bg-primary/80 align-middle ml-2 rounded-full" />
                                                                        </div>
                                                                    ) : isSource ? (
                                                                        <div className="font-bold text-xl text-foreground/80 font-headline hover:bg-muted p-2 rounded-md -ml-2">
                                                                            <Transliterate>{getIastLabelById(block!.type!)} ({getSanskritLabelById(block!.type!)})</Transliterate>
                                                                            <span className="inline-block h-0.5 w-[8%] bg-foreground/80 align-middle ml-2 rounded-full" />
                                                                        </div>
                                                                    ): <div></div>}
                                                                </div>
                                                                 {activeEditorBlockId === block.id && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 rounded-full z-10"
                                                                        onClick={() => removeBlock(block!.id!)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <RichTextEditor
                                                                id={block.id}
                                                                content={block.sanskrit || ''}
                                                                onChange={(value) => updateBlock(block.id!, { sanskrit: value })}
                                                                onFocus={() => setActiveEditorBlockId(block.id!)}
                                                                setEditorInstance={setEditorInstance}
                                                                removeEditorInstance={removeEditorInstance}
                                                                activeGlossary={activeGlossary}
                                                                onAddComment={handleAddComment}
                                                                onNewQuoteFound={handleNewQuoteFound}
                                                                placeholder="Type here..."
                                                            />
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[200px]">
                                            <p className="mb-4">This article has no content blocks.</p>
                                            <AddBlockDialog onAddBlock={addBlock} structure={bookData.structure}>
                                                <Button type="button" variant="default" size="lg">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Block
                                                </Button>
                                            </AddBlockDialog>
                                        </div>
                                    )}
                                    <EditorNotesDisplay blocks={blocks} highlightTarget={highlightTarget} onHighlight={handleHighlight} />
                                </div>
                            </div>
                        </div>
                    </main>
                    {!isMobile && (
                        <div id="intellicite-panel-container" className="relative flex-shrink-0 border-l">
                            <aside 
                                className={cn(
                                    "bg-card transition-all duration-300 ease-in-out h-full overflow-hidden",
                                    isPanelOpen ? "w-[340px]" : "w-0"
                                )}
                            >
                                <div className="w-[340px] h-full">
                                    {panelContent}
                                </div>
                            </aside>
                            <Button 
                                type="button"
                                variant="outline" 
                                size="icon" 
                                onClick={() => setIsPanelOpen(!isPanelOpen)}
                                className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full h-8 w-8 z-10 bg-background hover:bg-muted"
                                title="Toggle Assistant Panel"
                            >
                                {isPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}
                </div>
            </form>
            {blocks.length > 0 && (
                 <AddBlockDialog onAddBlock={addBlock} structure={bookData.structure}>
                    <Button type="button" size="icon" className="fixed z-10 bottom-8 right-8 h-14 w-14 rounded-full shadow-lg" aria-label="Add Content Block">
                        <Plus className="h-8 w-8" />
                    </Button>
                </AddBlockDialog>
            )}
        </div>
    )
}

function getCategoryForType(type: string | undefined): 'source' | 'commentary' {
    if (!type) return 'source';
    return ALL_COMMENTARY_TYPES.includes(type) ? 'commentary' : 'source';
}


export default function CreateArticlePageWrapper() {
    const params = useParams();
    const [bookData, setBookData] = useState<BookContent | null>(null);
    const [chapterData, setChapterData] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<BookTheme | null>(null);

    const bookId = params.bookId as string;
    const chapterId = params.chapterId as string;

    const findChapterInTree = useCallback((chapters: Chapter[], id: string): Chapter | null => {
        for (const chapter of chapters) {
            if (String(chapter.id) === id) return chapter;
            if (chapter.children) {
                const found = findChapterInTree(chapter.children, id);
                if (found) return found;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        if (bookId && chapterId) {
            Promise.all([
                getBookContentData(bookId),
                getThemeForBook(bookId),
                getDefaultTheme(),
            ]).then(([data, bookTheme, defTheme]) => {
                if (!data) {
                    notFound();
                } else {
                    setBookData(data);
                    const chapter = findChapterInTree(data.chapters, chapterId);
                    if (!chapter) {
                        notFound();
                    }
                    setChapterData(chapter);
                    const finalTheme = bookTheme.bookId === 'default' ? { ...defTheme, bookId } : bookTheme;
                    setTheme(finalTheme);
                }
                setLoading(false);
            });
        }
    }, [bookId, chapterId, findChapterInTree]);
    
    if (loading || !bookData || !chapterData || !theme) {
         return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <BookThemeProvider theme={theme}>
            <CreateArticlePageContent bookData={bookData} chapterData={chapterData} />
        </BookThemeProvider>
    )
}
