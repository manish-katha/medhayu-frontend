
'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import type { Article, BookContent, Chapter, ContentBlock, LinkableArticle, Editor } from '@/types';
import { handleAddLayer, handleLeaveSpark, handleStartDrift, handleConnectPoint, saveBlockNote } from '@/app/articles/actions';
import { searchLinkableArticles } from '@/services/book.service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    articleInfo: { book: BookContent; chapter: Chapter; article: Article };
    block: ContentBlock;
};

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}

function useInteractionDialog(state: any, onOpenChange: (open: boolean) => void) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.message });
            onOpenChange(false);
            formRef.current?.reset();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast, onOpenChange]);
    
    return formRef;
}

export function SparkDialog({ open, onOpenChange, articleInfo, block }: DialogProps) {
    const [state, formAction] = useActionState(handleLeaveSpark, null);
    const formRef = useInteractionDialog(state, onOpenChange);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Spark</DialogTitle>
                    <DialogDescription>Share a brief idea, question, or insight related to this block.</DialogDescription>
                </DialogHeader>
                 <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.book.bookId} />
                    <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id)} />
                    <input type="hidden" name="verse" value={String(articleInfo.article.verse)} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <Textarea name="content" placeholder="What's on your mind?" required />
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Leave Spark</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function LayerDialog({ open, onOpenChange, articleInfo, block }: DialogProps) {
    const [state, formAction] = useActionState(handleAddLayer, null);
    const formRef = useInteractionDialog(state, onOpenChange);
    const [content, setContent] = useState('');
    const [editor, setEditor] = useState<Editor | null>(null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add a Layer</DialogTitle>
                    <DialogDescription>Add a detailed annotation or parallel commentary to this block.</DialogDescription>
                </DialogHeader>
                 <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.book.bookId} />
                    <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id)} />
                    <input type="hidden" name="verse" value={String(articleInfo.article.verse)} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <input type="hidden" name="content" value={content} />
                    
                    <div className="border rounded-md min-h-[250px] flex flex-col">
                        {editor && <EditorToolbar editor={editor} />}
                        <div className="flex-1 p-2">
                             <RichTextEditor
                                id="layer-editor"
                                content={content}
                                onChange={setContent}
                                setEditorInstance={(id, editor) => setEditor(editor)}
                                removeEditorInstance={() => setEditor(null)}
                                placeholder="Your detailed annotation..."
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Add Layer</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function PointDialog({ open, onOpenChange, articleInfo, block }: DialogProps) {
    const [state, formAction] = useActionState(handleConnectPoint, null);
    const formRef = useInteractionDialog(state, onOpenChange);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<LinkableArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<LinkableArticle | null>(null);

    useEffect(() => {
        if (debouncedSearchQuery.length > 2) {
            searchLinkableArticles(debouncedSearchQuery).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedArticle(null);
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Connect Point</DialogTitle>
                    <DialogDescription>Find another article or block to create a semantic link.</DialogDescription>
                </DialogHeader>
                 <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.book.bookId} />
                    <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id)} />
                    <input type="hidden" name="verse" value={String(articleInfo.article.verse)} />
                    <input type="hidden" name="blockId" value={block.id} />
                    {selectedArticle && (
                        <>
                            <input type="hidden" name="targetBookId" value={selectedArticle.url.split('/')[2]} />
                            <input type="hidden" name="targetChapterId" value={selectedArticle.url.split('/')[3]} />
                            <input type="hidden" name="targetVerse" value={selectedArticle.url.split('/')[4]} />
                            <input type="hidden" name="targetArticleTitle" value={selectedArticle.label} />
                        </>
                    )}
                    
                    <div>
                        <Label>Search for article to connect</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by title, chapter..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedArticle(null);
                                }}
                            />
                        </div>
                    </div>
                     {searchResults.length > 0 && !selectedArticle && (
                        <ScrollArea className="h-48 border rounded-md">
                             <div className="p-2 space-y-1">
                                {searchResults.map(res => (
                                    <Button key={res.id} variant="ghost" className="w-full justify-start text-left h-auto" onClick={() => { setSearchQuery(res.label); setSelectedArticle(res); }}>
                                        {res.label}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                     <Textarea name="comment" placeholder="Why is this relevant? (optional)" rows={3} />
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Connect Point</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function DriftDialog({ open, onOpenChange, articleInfo, block }: DialogProps) {
    const [state, formAction] = useActionState(handleStartDrift, null);
    const formRef = useInteractionDialog(state, onOpenChange);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start a Drift</DialogTitle>
                    <DialogDescription>This will create a new standalone article, using this block as the starting point. You can evolve it independently from there.</DialogDescription>
                </DialogHeader>
                 <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.book.bookId} />
                    <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id)} />
                    <input type="hidden" name="verse" value={String(articleInfo.article.verse)} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <input type="hidden" name="content" value={block.sanskrit} />
                     <div>
                        <Label htmlFor="drift-title">New Article Title</Label>
                        <Input id="drift-title" name="title" required placeholder="Title for your new article" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Start Drift</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function NoteDialog({ open, onOpenChange, articleInfo, block, existingNote }: DialogProps & { existingNote?: string }) {
    const [state, formAction] = useActionState(saveBlockNote, null);
    const formRef = useInteractionDialog(state, onOpenChange);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{existingNote ? 'Edit' : 'Add'} Private Note</DialogTitle>
                    <DialogDescription>This note is only visible to you. It's linked to the selected block of text.</DialogDescription>
                </DialogHeader>
                 <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.book.bookId} />
                    <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id)} />
                    <input type="hidden" name="verse" value={String(articleInfo.article.verse)} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <input type="hidden" name="bookName" value={articleInfo.book.bookName} />
                    <input type="hidden" name="articleTitle" value={articleInfo.article.title} />
                    <input type="hidden" name="blockTextPreview" value={block.sanskrit.replace(/<[^>]+>/g, ' ').substring(0, 100)} />

                    <Textarea name="note" defaultValue={existingNote} placeholder="Your private reflections..." required rows={6} />
                    {state?.fieldErrors?.note && <p className="text-sm text-destructive mt-1">{state.fieldErrors.note[0]}</p>}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Save Note</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
