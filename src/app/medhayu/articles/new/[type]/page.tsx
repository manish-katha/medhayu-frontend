

'use client';

import React, { useActionState, useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import type { Editor, Range } from '@tiptap/react';
import { createStandaloneArticle, createStandaloneArticleCategory } from '@/actions/standalone-article.actions';
import { getStandaloneArticleCategories } from '@/services/standalone-article.service';
import { getQuoteData } from '@/services/quote.service';
import type { StandaloneArticleCategory, Quote, QuoteCategory, GlossaryCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft, Plus, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import dynamic from 'next/dynamic';
import { IntellicitePanel } from '@/components/admin/intellicite-panel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { WhitepaperForm } from '@/components/admin/whitepaper-form';


const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor').then(mod => mod.RichTextEditor), { 
    ssr: false, 
    loading: () => <p>Loading...</p>
});


function SubmitButton({ children }: { children: React.ReactNode}) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {children}
        </Button>
    );
}

function CreateCategoryDialog({ onCategoryCreated }: { onCategoryCreated: () => void; }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createStandaloneArticleCategory, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: "Category created." });
      setOpen(false);
      onCategoryCreated();
    }
    if (state?.error) {
      toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  }, [state, toast, onCategoryCreated]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="flex-shrink-0" title="Add new category">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" required />
             {state?.fieldErrors?.name && <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function NewStandaloneArticlePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const type = params.type as 'article' | 'abstract' | 'whitepaper' | 'case-study';
    
    const [categories, setCategories] = useState<StandaloneArticleCategory[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
    const [activeGlossary, setActiveGlossary] = useState<GlossaryCategory | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [quoteCategories, setQuoteCategories] = React.useState<QuoteCategory[]>([]);
    const [quoteDialogState, setQuoteDialogState] = React.useState<{ open: boolean; text: string; range: Range | null }>({ open: false, text: '', range: null });

    const [state, formAction] = useActionState(createStandaloneArticle, null);

    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');

    const fetchCategories = useCallback(() => {
        getStandaloneArticleCategories().then(setCategories);
    }, []);

    useEffect(() => {
        fetchCategories();
        getQuoteData().then(setQuoteCategories);
    }, [fetchCategories]); 

    useEffect(() => {
        if (state?.success && state.redirectPath) {
            toast({ title: "Success!", description: state.message });
            router.push(state.redirectPath);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Creation Failed", description: state.error });
        }
    }, [state, toast, router]);
    
    const handleNewQuoteFound = useCallback((text: string, range: Range) => {
        setQuoteDialogState({ open: true, text, range });
    }, []);

    const handleQuoteCreated = useCallback((newQuote?: Quote) => {
        const range = quoteDialogState.range;
        if (!newQuote || !range || !editorInstance) {
             setQuoteDialogState({ open: false, text: '', range: null });
            return;
        }
        
        editorInstance.chain().focus()
            .deleteRange(range)
            .insertContent({
                type: 'blockquote',
                attrs: { author: newQuote.author },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: `“${newQuote.quote}”` }] }]
            })
            .run();
            
        setQuoteDialogState({ open: false, text: '', range: null });
    }, [editorInstance, quoteDialogState.range]);

    if (!['article', 'abstract', 'whitepaper', 'case-study'].includes(type)) {
        return notFound();
    }

    if (type === 'whitepaper' || type === 'abstract') {
        return <WhitepaperForm categories={categories} formAction={formAction} state={state} type={type} />;
    }
    
    const backPath = type === 'case-study' ? '/case-studies' : '/medhayu/articles';
    const backLabel = type === 'case-study' ? 'Case Studies' : 'Articles';


    const panelContent = (
      <IntellicitePanel
        tags={[]}
        onTagsChange={() => {}}
        editor={editorInstance}
        blocks={[{ id: '1', type: 'prose', sanskrit: content }]}
        activeGlossary={activeGlossary}
        onActiveGlossaryChange={setActiveGlossary}
        articleInfo={null}
        onHighlight={() => {}}
        headerActions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push(backPath)}>Cancel</Button>
            <SubmitButton>Create {typeLabel}</SubmitButton>
          </div>
        }
      />
    );


    // Standard editor for 'article' and 'case-study'
    return (
         <div className="h-screen flex flex-col bg-muted/40">
            <CreateQuoteDialog
                open={quoteDialogState.open}
                onOpenChange={(isOpen) => setQuoteDialogState(prev => ({ ...prev, open: isOpen }))}
                initialQuote={quoteDialogState.text}
                onQuoteCreated={handleQuoteCreated}
                categories={quoteCategories}
            />
            <form action={formAction} className="flex-1 flex flex-col min-h-0">
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="content" value={content} />

                <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-20">
                    <div className="flex-1 min-w-0">
                        <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                            <Link href={backPath}><ArrowLeft className="mr-2 h-4 w-4" /> Back to {backLabel}</Link>
                        </Button>
                        <h1 className="text-xl font-bold truncate">New {typeLabel}</h1>
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
                    <main className="flex-1 flex flex-col overflow-hidden">
                        {editorInstance && (
                            <div className="editor-toolbar-container flex-shrink-0 border-b z-10 bg-background/95 backdrop-blur-sm">
                                <EditorToolbar editor={editorInstance} />
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-8 sm:p-12">
                            <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input 
                                            id="title"
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="text-3xl font-bold font-headline h-auto p-2"
                                            required
                                        />
                                        {state?.fieldErrors?.title && <p className="text-sm text-destructive mt-1">{state.fieldErrors.title[0]}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="categoryId">Category</Label>
                                        <div className="flex items-center gap-2">
                                            <Select name="categoryId" required defaultValue={type === 'case-study' ? 'case-studies' : 'uncategorized'}>
                                                <SelectTrigger id="categoryId">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <CreateCategoryDialog onCategoryCreated={fetchCategories} />
                                        </div>
                                        {state?.fieldErrors?.categoryId && <p className="text-sm text-destructive mt-1">{state.fieldErrors.categoryId[0]}</p>}
                                    </div>
                                </div>

                                <RichTextEditor
                                    id="content-editor"
                                    content={content}
                                    onChange={setContent}
                                    setEditorInstance={(id, editor) => setEditorInstance(editor)}
                                    removeEditorInstance={() => setEditorInstance(null)}
                                    activeGlossary={activeGlossary}
                                    onNewQuoteFound={handleNewQuoteFound}
                                />
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
        </div>
    )
}
