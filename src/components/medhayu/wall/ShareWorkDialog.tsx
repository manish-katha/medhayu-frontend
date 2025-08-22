

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBooks } from '@/services/book.service';
import { getStandaloneArticles } from '@/services/standalone-article.service';
import { getCaseStudies } from '@/services/case-study.service';
import type { Book, StandaloneArticle, CaseStudy, Circle, Post } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Save, BookOpen, TextQuote, Send } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { addPost } from '@/services/post.service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Editor } from '@tiptap/react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import { useFormStatus } from 'react-dom';


interface ShareWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
  onWorkSelected?: (work: Book | StandaloneArticle | CaseStudy) => void;
  filter?: 'book' | 'case-study' | 'article' | 'aushadhi';
  userCircles?: Circle[];
  preselectedWork?: Book | StandaloneArticle | CaseStudy;
  workHtmlContent?: string | null;
  isTextSnippet?: boolean;
}

const WorkList = ({ items, onSelect, type }: { items: any[], onSelect: (item: any) => void, type: string }) => {
    if (type === 'books') {
         return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map(book => (
                     <button key={book.id} onClick={() => onSelect(book)} className="group space-y-2 text-left">
                        <div className="aspect-[4/6] relative bg-muted rounded-md overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                            <Image
                            src={book.profileUrl || 'https://placehold.co/400x600.png'}
                            alt={book.name}
                            layout="fill"
                            objectFit="cover"
                            />
                        </div>
                        <p className="font-semibold text-sm truncate">{book.name}</p>
                     </button>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {items.map(item => {
                 const displayText = type === 'casestudies' ? `Case Study on ${item.condition}` : item.type;
                 return (
                 <button key={item.id} onClick={() => onSelect(item)} className="w-full text-left p-2 rounded-md hover:bg-muted">
                   <p className="font-medium">{item.title}</p>
                   <p className="text-sm text-muted-foreground capitalize">
                     {displayText}
                   </p>
                 </button>
                 )
            })}
        </div>
    )
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={pending}>
            <Send className="mr-2 h-4 w-4" />
            {pending ? 'Posting...' : 'Post'}
        </Button>
    )
}


export function ShareWorkDialog({ open, onOpenChange, onPostCreated = () => {}, onWorkSelected, filter, userCircles = [], preselectedWork, workHtmlContent, isTextSnippet = false }: ShareWorkDialogProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<StandaloneArticle[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedWork, setSelectedWork] = useState<Book | StandaloneArticle | CaseStudy | null>(preselectedWork || null);
  const [selectedCircle, setSelectedCircle] = useState('public');
  const [opinion, setOpinion] = useState('');
  const { toast } = useToast();
  
  const [editor, setEditor] = React.useState<Editor | null>(null);

  const dialogTitle = isTextSnippet ? 'Post Selection to Wall' : (filter === 'case-study' ? 'Share a Case Study' : 'Share a Work');
  const dialogDescription = isTextSnippet ? 'Add your commentary to the selected text and share it with the community.' : 'Select a work from your library to attach to your post.';


  useEffect(() => {
    if (open && !preselectedWork) {
      setLoading(true);
      Promise.all([getBooks(), getStandaloneArticles(), getCaseStudies()]).then(([bookData, articleData, caseStudyData]) => {
        setBooks(bookData);
        setArticles(articleData);
        setCaseStudies(caseStudyData);
        setLoading(false);
      });
    } else if(preselectedWork) {
      setSelectedWork(preselectedWork);
    }
    
    if (!open) {
        // Reset state when dialog closes
        if (!preselectedWork) setSelectedWork(null);
        setSearch('');
        setOpinion('');
        editor?.commands.clearContent();
    }
  }, [open, preselectedWork, editor]);

  const filteredBooks = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const filteredArticles = articles.filter(a => a.type === 'article' && a.title.toLowerCase().includes(search.toLowerCase()));
  const filteredWhitepapers = articles.filter(a => a.type === 'whitepaper' && a.title.toLowerCase().includes(search.toLowerCase()));
  const filteredCaseStudies = caseStudies.filter(cs => cs.title.toLowerCase().includes(search.toLowerCase()));


  const handleSelect = (item: Book | StandaloneArticle | CaseStudy) => {
    setSelectedWork(item);
    if(onWorkSelected) onWorkSelected(item);
  };
  
  const handleConfirmShare = async () => {
    let postContent = '';
    let attachedWorkData: Post['attachedWork'] | undefined = undefined;

    if (isTextSnippet && workHtmlContent) {
        postContent = `${opinion ? `${opinion}` : ''}<blockquote>${workHtmlContent}</blockquote>`;
    } else if (selectedWork) {
        postContent = opinion || `Sharing an interesting work: <strong>${(selectedWork as any).name || selectedWork.title}</strong>`;
        let workType = (selectedWork as any).type || 'book';
        if ('condition' in selectedWork) workType = 'case-study';
        
        attachedWorkData = {
            type: workType,
            href: workType === 'book' ? `/medhayu/books/${selectedWork.id}` : (workType === 'case-study' ? `/case-studies/${selectedWork.id}` : `/articles/edit/${selectedWork.id}`),
            title: (selectedWork as any).name || selectedWork.title,
            parentTitle: (selectedWork as any).categoryId,
            description: workHtmlContent || (selectedWork as any).description || (selectedWork as any).content || (selectedWork as any).summary,
            profileUrl: (selectedWork as any).profileUrl,
        };
    } else {
        toast({ title: 'No work selected', variant: 'destructive' });
        return;
    }
    
    const newPost: Omit<Post, 'id' | 'createdAt' | 'author'> = {
        postType: (attachedWorkData?.type || 'thought') as any,
        content: postContent,
        attachedWork: attachedWorkData,
        circleId: selectedCircle === 'public' ? undefined : selectedCircle,
    };
    await addPost(newPost);
    toast({ title: 'Shared successfully!' });
    onPostCreated();
    onOpenChange(false);
  }

  const renderContent = () => {
    if (filter === 'case-study') {
        return <WorkList items={filteredCaseStudies} onSelect={handleSelect} type="casestudies" />
    }
    
    return (
        <Tabs defaultValue="books" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="books" disabled={filter === 'article'}>Books</TabsTrigger>
                <TabsTrigger value="articles" disabled={filter === 'book'}>Articles</TabsTrigger>
                <TabsTrigger value="whitepapers" disabled={filter === 'book'}>White Papers</TabsTrigger>
            </TabsList>
            <ScrollArea className="mt-4 flex-1">
                <TabsContent value="books"><WorkList items={filteredBooks} onSelect={handleSelect} type="books" /></TabsContent>
                <TabsContent value="articles"><WorkList items={filteredArticles} onSelect={handleSelect} type="articles" /></TabsContent>
                <TabsContent value="whitepapers"><WorkList items={filteredWhitepapers} onSelect={handleSelect} type="whitepapers" /></TabsContent>
            </ScrollArea>
        </Tabs>
    );
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
         <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
            {!preselectedWork && !isTextSnippet && (
                <div className="col-span-2 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search works..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    <div className="flex-1 border rounded-md p-2">
                        <ScrollArea className="h-full">
                            {renderContent()}
                        </ScrollArea>
                    </div>
                </div>
            )}
            <div className={preselectedWork || isTextSnippet ? 'col-span-3 flex flex-col' : 'col-span-1'}>
                <Card className="sticky top-0 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Selection Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                       {selectedWork && !isTextSnippet ? (
                            <div>
                                <p className="font-bold">{(selectedWork as any).name || selectedWork.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-4" dangerouslySetInnerHTML={{__html: (selectedWork as any).description || (selectedWork as any).summary || (selectedWork as any).content || ''}} />
                                <Textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} placeholder="Add your opinion..." className="mt-2" />
                            </div>
                       ) : isTextSnippet && workHtmlContent ? (
                            <div className="space-y-4 h-full flex flex-col">
                                <Label>Quoted Text:</Label>
                                <blockquote className="border-l-4 pl-4 italic text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto" dangerouslySetInnerHTML={{ __html: workHtmlContent }}>
                                </blockquote>
                                <div className="border rounded-md min-h-[150px] flex-1 flex flex-col">
                                    {editor && <EditorToolbar editor={editor} />}
                                    <div className="p-2 flex-grow">
                                        <RichTextEditor
                                            id="opinion-editor"
                                            content={opinion}
                                            onChange={setOpinion}
                                            setEditorInstance={(id, instance) => setEditor(instance)}
                                            removeEditorInstance={() => setEditor(null)}
                                            placeholder="Add your opinion or note... (optional)"
                                        />
                                    </div>
                                </div>
                            </div>
                       ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Select an item from the list to see details and post.</p>
                       )}
                    </CardContent>
                    <CardFooter className="p-4 border-t mt-auto">
                      {(selectedWork || isTextSnippet) && (
                           <div className="w-full flex justify-between items-center">
                               <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Post to Public</SelectItem>
                                        {userCircles.map(circle => (
                                            <SelectItem key={circle.id} value={circle.id}>{circle.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 <div className="flex justify-end pt-2">
                                    <Button onClick={handleConfirmShare} disabled={!selectedWork && !isTextSnippet}>
                                        <Save className="mr-2 h-4 w-4" /> Share
                                    </Button>
                                 </div>
                           </div>
                       )}
                    </CardFooter>
                </Card>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
