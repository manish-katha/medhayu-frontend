
'use client';

import React, { useActionState, useState, useEffect, useCallback, useTransition } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import type { Editor, Range } from '@tiptap/react';
import { type Article as ArticleType, type ContentBlock, type BookContent, type Chapter, type Quote, type QuoteCategory, type GlossaryCategory, Comment } from '@/types';
import { getQuoteData } from '@/services/quote.service';
import { updateArticle } from '@/actions/book.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { EditorNotesDisplay } from '@/components/admin/editor/notes-display';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Save, ArrowLeft, Trash2, Eye, ChevronLeft, ChevronRight, Menu, Plus, CheckCircle2 } from 'lucide-react';
import { AddBlockDialog, CommentaryDialog, SourceInfoDialog } from '@/components/admin/book-forms';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { ALL_COMMENTARY_TYPES, getTypeLabelById, getSanskritLabelById, ALL_SOURCE_TYPES, getIastLabelById } from '@/types/sanskrit.types';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArticleRenderer } from '@/components/article-renderer';
import dynamic from 'next/dynamic';
import { IntellicitePanel } from '@/components/admin/intellicite-panel';
import { cn } from '@/lib/utils';
import { ArticleTocDisplay } from '@/components/admin/article-toc-display';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Transliterate } from '@/components/transliteration-provider';
import { CommentFormDialog } from '@/components/medhayu/Article renderer/comment-form-dialog';
import { useBookTheme } from '@/components/theme/BookThemeContext';
import { ThemeApplier } from '@/components/theme/ThemeApplier';


const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor').then(mod => mod.RichTextEditor), { 
    ssr: false, 
    loading: () => <div className="prose-styling min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 animate-pulse" /> 
});


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
        </Button>
    );
}

export function EditArticlePageClient(props: { initialArticleData: { book: BookContent, chapter: any, article: ArticleType }, params: { bookId: string; chapterId: string; verse: string; } }) {
    const { initialArticleData, params } = props;
    const router = useRouter();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const { bookId, chapterId, verse } = params;

    const [articleData, setArticleData] = useState(initialArticleData);
    const [title, setTitle] = useState(initialArticleData.article.title);
    const [blocks, setBlocks] = useState<Partial<ContentBlock>[]>(initialArticleData.article.content);
    const [tags, setTags] = useState<string[]>(initialArticleData.article.tags || []);
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
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);

    const [state, formAction] = useActionState(updateArticle, null);
    const [isPending, startTransition] = useTransition();

    const POETIC_TYPES = ['shloka', 'sutra', 'padya', 'richa', 'mantra', 'upanishad'];
    
     useEffect(() => {
        getQuoteData().then(setQuoteCategories);
    }, []);

    const handleGlobalClick = useCallback((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isInEditorBlock = target.closest('.article-editor-block');
        const isInToolbar = target.closest('.editor-toolbar-container');
        const isInPopper = target.closest('[data-radix-popper-content-wrapper], .tippy-box, [role="dialog"], [role="menu"]');
        const isInPanel = target.closest('#intellicite-panel-container, [data-radix-dialog-content]');

        if (!isInEditorBlock && !isInPopper && !isInPanel && !isInToolbar) {
            setActiveEditorBlockId(null);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleGlobalClick);
        setIsFullyLoaded(true);
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [handleGlobalClick]);

    
    // Auto-save logic
    const debouncedBlocks = useDebounce(blocks, 2000);
    const debouncedTitle = useDebounce(title, 2000);

    useEffect(() => {
        if (!isFullyLoaded || !bookId || !chapterId || !verse) return;

        const performAutoSave = () => {
             const formData = new FormData();
            formData.append('bookId', bookId);
            formData.append('chapterId', String(chapterId));
            formData.append('verse', String(verse));
            formData.append('title', title);
            formData.append('content', JSON.stringify(blocks));
            formData.append('tags', JSON.stringify(tags));
            startTransition(() => {
                formAction(formData);
            });
        }

        performAutoSave();

    }, [debouncedBlocks, debouncedTitle, tags, isFullyLoaded, bookId, chapterId, verse, title, blocks, startTransition, formAction]);


    useEffect(() => {
        if (state?.success && isFullyLoaded) { 
            toast({
              title: (
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <span>Saved</span>
                </div>
              ),
              duration: 2000,
            });
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Update Failed", description: state.error });
        }
    }, [state, toast, isFullyLoaded]);

    const updateBlock = useCallback((id: string, updates: Partial<Omit<ContentBlock, 'id'>>) => {
        setBlocks(currentBlocks =>
          currentBlocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
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

    const removeBlock = (id: string) => {
        setBlocks(currentBlocks => currentBlocks.filter(block => block.id !== id));
    };

    const handleClearBlocks = () => {
        setBlocks([]);
        setEditorInstances(new Map());
        setIsClearConfirmOpen(false);
    };

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
    
    const handleNewQuoteFound = useCallback((text: string, range: Range) => {
        setQuoteDialogState({ open: true, text, range });
    }, []);
    
    const handleAddComment = useCallback((text: string) => {
        setCommentDialogState({ open: true, text });
    }, []);

    const handleQuoteCreated = React.useCallback((newQuote?: Quote) => {
        const range = quoteDialogState.range;
        if (!newQuote || !range || !editorInstances.size) {
             setQuoteDialogState({ open: false, text: '', range: null });
            return;
        }
        
        const editor = activeEditorBlockId ? editorInstances.get(activeEditorBlockId) : null;
        if (!editor) return;

        editor.chain().focus().deleteRange(range).insertContent({
            type: 'blockquote',
            attrs: { author: newQuote.author },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `“${newQuote.quote}”` }] }]
        }).run();

        setQuoteDialogState({ open: false, text: '', range: null });
    }, [editorInstances, activeEditorBlockId, quoteDialogState.range]);

    const { book, chapter, article } = articleData;
    const { theme } = useBookTheme();
    
    const blockToEdit = dialogState.blockId ? blocks.find(b => b.id === dialogState.blockId) : null;
    const activeEditorInstance = activeEditorBlockId ? editorInstances.get(activeEditorBlockId) : null;
    
    const handleHighlight = (id: string) => {
        setHighlightTarget(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => setHighlightTarget(null), 1200);
    };

    const panelContent = (
        <IntellicitePanel 
            tags={tags} 
            onTagsChange={setTags} 
            editor={activeEditorInstance} 
            blocks={blocks}
            activeGlossary={activeGlossary}
            onActiveGlossaryChange={setActiveGlossary}
            articleInfo={articleData}
            onHighlight={handleHighlight}
            headerActions={
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" type="button"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-4xl">
                            <SheetHeader>
                            <SheetTitle>Article Preview</SheetTitle>
                            <SheetDescription>
                                {chapter.name}, Shloka {article.verse}
                            </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-80px)]">
                            <div className="p-4 note-editor">
                                <ArticleRenderer blocks={blocks.map(b => ({...b, id: b.id || '', sanskrit: b.sanskrit || '', type: b.type || 'shloka'})) as ContentBlock[]} />
                            </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="sm" type="button" onClick={() => router.push(`/medhayu/books/${bookId}`)}>Cancel</Button>
                    <SubmitButton />
                </div>
            }
        />
    );


    return (
        <div className="h-screen flex flex-col bg-muted/40">
            {theme && <ThemeApplier theme={theme} scopeToId="theme-preview" />}
            <CreateQuoteDialog
                open={quoteDialogState.open}
                onOpenChange={(isOpen) => setQuoteDialogState(prev => ({ ...prev, open: isOpen }))}
                initialQuote={quoteDialogState.text}
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
            <CommentaryDialog
                open={dialogState.type === 'commentary'}
                onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, blockId: null })}
                initialData={blockToEdit?.commentary || { type: blockToEdit?.type || 'bhashya', author: '', workName: '', shortName: ''}}
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
                blockType={blockToEdit?.type || 'shloka'}
            />
            <form action={formAction} className="flex-1 flex flex-col min-h-0">
                <input type="hidden" name="bookId" value={bookId} />
                <input type="hidden" name="chapterId" value={String(chapterId)} />
                <input type="hidden" name="verse" value={String(article.verse)} />
                <input type="hidden" name="tags" value={JSON.stringify(tags)} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="content" value={JSON.stringify(blocks)} />
                
                <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-20">
                     <div className="flex-1 min-w-0">
                         <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                            <Link href={`/medhayu/books/${bookId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to {book.bookName}</Link>
                        </Button>
                    </div>
                     <div className="flex items-center gap-2">
                        {state?.success && isFullyLoaded && <span className="text-xs text-muted-foreground">Saved</span>}
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
                    <main id="theme-preview" className="flex-1 flex flex-col overflow-hidden bg-muted/40">
                         {activeEditorInstance && (
                            <div className="editor-toolbar-container flex-shrink-0 border-b z-10 bg-background/95 backdrop-blur-sm">
                                <EditorToolbar editor={activeEditorInstance} />
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-8 sm:p-12 bg-card note-editor note-context clearfix w-full">
                                <div className="flex justify-between items-start mb-6 border-b pb-4">
                                    <div>
                                        <Input 
                                            name="title" 
                                            value={title} 
                                            onChange={e => setTitle(e.target.value)} 
                                            className="text-3xl font-bold font-headline h-auto p-2 border-0 shadow-none focus-visible:ring-0 mb-1" 
                                        />
                                        <h2 className="text-xl text-muted-foreground font-headline pl-2">
                                            {chapter.name}, Verse {article.verse}
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
                                            const prevBlock = index > 0 ? blocks[index - 1] : null;
                                            const isCommentary = ALL_COMMENTARY_TYPES.includes(block!.type!);
                                            const isSource = ALL_SOURCE_TYPES.includes(block!.type!);
                                            const useTightSpacing = prevBlock && POETIC_TYPES.includes(block!.type!) && POETIC_TYPES.includes(prevBlock!.type!);
                                            return (
                                                <React.Fragment key={block!.id}>
                                                    {index > 0 && <Separator className={useTightSpacing ? "my-1" : "my-6"} />}
                                                    <div className={cn("article-editor-block relative", highlightTarget === block!.id && 'highlight-flash')} id={block!.id}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            {isCommentary ? (
                                                                <div 
                                                                    className="font-bold text-xl text-primary/80 font-headline cursor-pointer hover:bg-muted p-2 rounded-md -ml-2" 
                                                                    onClick={() => setDialogState({ type: 'commentary', blockId: block!.id! })}
                                                                >
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
                                                                 <div 
                                                                    className="font-bold text-xl text-foreground/80 font-headline cursor-pointer hover:bg-muted p-2 rounded-md -ml-2" 
                                                                    onClick={() => setDialogState({ type: 'source', blockId: block!.id! })}
                                                                >
                                                                     <Transliterate>{getIastLabelById(block!.type!)} ({getSanskritLabelById(block!.type!)})</Transliterate>
                                                                     <span className="inline-block h-0.5 w-[8%] bg-foreground/80 align-middle ml-2 rounded-full" />
                                                                </div>
                                                            ): <div></div>}
                                                            {activeEditorBlockId === block!.id && (
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
                                                            id={block!.id!}
                                                            content={block!.sanskrit!}
                                                            onChange={(value) => updateBlock(block!.id!, { sanskrit: value })}
                                                            placeholder="Type here..."
                                                            onFocus={() => setActiveEditorBlockId(block!.id!)}
                                                            setEditorInstance={setEditorInstance}
                                                            removeEditorInstance={removeEditorInstance}
                                                            activeGlossary={activeGlossary}
                                                            onNewQuoteFound={handleNewQuoteFound}
                                                            onAddComment={handleAddComment}
                                                        />
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[200px]">
                                            <p className="mb-4">This article has no content blocks.</p>
                                            <AddBlockDialog onAddBlock={addBlock} structure={book.structure}>
                                                <Button type="button" variant="default" size="lg">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Block
                                                </Button>
                                            </AddBlockDialog>
                                        </div>
                                    )}
                                    <EditorNotesDisplay blocks={blocks} onHighlight={handleHighlight} highlightTarget={highlightTarget} />
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
                                title="Toggle Intellicite Panel"
                            >
                                {isPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}
                </div>
            </form>
            {blocks.length > 0 && (
                 <AddBlockDialog onAddBlock={addBlock} structure={book.structure}>
                    <Button
                        type="button"
                        size="icon"
                        className="fixed z-10 bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                        aria-label="Add Content Block"
                    >
                        <Plus className="h-8 w-8" />
                    </Button>
                </AddBlockDialog>
            )}
        </div>
    )
}
