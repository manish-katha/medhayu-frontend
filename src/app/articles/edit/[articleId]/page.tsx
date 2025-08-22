

'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import type { Editor, Range } from '@tiptap/react';
import { getStandaloneArticle } from '@/services/standalone-article.service';
import { getQuoteData } from '@/services/quote.service';
import { getCaseStudyById } from '@/services/case-study.service';
import type { StandaloneArticle, Quote, QuoteCategory, GlossaryCategory, CaseStudy } from '@/types';
import { updateStandaloneArticle } from '@/actions/standalone-article.actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { IntellicitePanel } from '@/components/admin/intellicite-panel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
        </Button>
    );
}

export default function EditStandaloneArticlePage({ params: paramsProp }: { params: { articleId: string } }) {
    const params = use(paramsProp);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const articleId = params.articleId as string;
    const isCaseStudy = articleId.startsWith('cs-');

    const [articleData, setArticleData] = useState<StandaloneArticle | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
    const [activeGlossary, setActiveGlossary] = useState<GlossaryCategory | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [quoteCategories, setQuoteCategories] = React.useState<QuoteCategory[]>([]);
    const [quoteDialogState, setQuoteDialogState] = React.useState<{ open: boolean; text: string; range: Range | null }>({ open: false, text: '', range: null });

    const [state, formAction] = useActionState(updateStandaloneArticle, null);
    
    const fromPath = searchParams.get('from') || (isCaseStudy ? '/case-studies' : '/medhayu/articles');
    const fromLabel = isCaseStudy ? 'Case Studies' : fromPath.includes('drift') ? 'Drift Stream' : 'Articles';

    useEffect(() => {
        getQuoteData().then(setQuoteCategories);
    }, []);

    useEffect(() => {
        if (!articleId) return;

        async function fetchData() {
            let data: StandaloneArticle | null = null;
            if (isCaseStudy) {
                const caseStudy: CaseStudy | undefined = await getCaseStudyById(articleId);
                if (caseStudy) {
                    // Adapt CaseStudy to StandaloneArticle shape
                    data = {
                        id: caseStudy.id,
                        title: caseStudy.title,
                        content: `<p>${caseStudy.summary}</p>`, // Simple conversion for now
                        type: 'case-study',
                        categoryId: 'case-studies',
                        tags: [],
                        createdAt: caseStudy.date,
                        updatedAt: caseStudy.date,
                    };
                }
            } else {
                data = await getStandaloneArticle(articleId);
            }

            if (!data) {
                notFound();
            } else {
                setArticleData(data);
                setTitle(data.title);
                setContent(data.content);
            }
        }
        fetchData();
    }, [articleId, isCaseStudy]);


    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.message });
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Update Failed", description: state.error });
        }
    }, [state, toast]);

    const handleNewQuoteFound = React.useCallback((text: string, range: Range) => {
        setQuoteDialogState({ open: true, text, range });
    }, []);

    const handleQuoteCreated = React.useCallback((newQuote?: Quote) => {
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


    if (!articleData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    const panelContent = (
        <IntellicitePanel 
            tags={[]} 
            onTagsChange={() => {}} 
            editor={editorInstance} 
            blocks={[{id:'1', type: 'prose', sanskrit: content}]}
            activeGlossary={activeGlossary}
            onActiveGlossaryChange={setActiveGlossary}
            articleInfo={null} // Standalone articles don't have book context
            onHighlight={() => {}}
            headerActions={
                 <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => router.push(fromPath)}>Cancel</Button>
                    <SubmitButton />
                 </div>
            }
        />
    );


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
                <input type="hidden" name="id" value={articleData.id} />
                <input type="hidden" name="content" value={content} />
                 {/* Add type so the server action knows what it's updating */}
                <input type="hidden" name="type" value={articleData.type} />
                 <input type="hidden" name="categoryId" value={articleData.categoryId} />

                <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-20">
                     <div className="flex items-center gap-2">
                         <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                            <Link href={fromPath}><ArrowLeft className="mr-2 h-4 w-4" /> Back to {fromLabel}</Link>
                        </Button>
                     </div>
                     <div className="flex items-center gap-2">
                         <h1 className="text-xl font-bold truncate hidden sm:block">{articleData.title}</h1>
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
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
                            <div className="max-w-4xl mx-auto bg-card p-4 sm:p-8 rounded-lg shadow-sm">
                                <Input 
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-3xl font-bold font-headline h-auto p-2 border-0 shadow-none focus-visible:ring-0 mb-8"
                                />
                                
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
