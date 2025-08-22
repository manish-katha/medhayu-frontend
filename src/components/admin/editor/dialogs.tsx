
'use client';

import React, { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBooks, getBookContent } from '@/services/book.service';
import { getStandaloneArticles } from '@/services/standalone-article.service';
import type { Book, BookContent, StandaloneArticle } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';


// --- Link Dialog ---
interface LinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onSave: (url: string) => void;
}

export function LinkDialog({ isOpen, onOpenChange, initialUrl, onSave }: LinkDialogProps) {
  const [url, setUrl] = useState('');
  useEffect(() => { setUrl(initialUrl || ''); }, [initialUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Link</DialogTitle></DialogHeader>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(url); onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Article Link Dialog ---
interface ArticleLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLink: (url: string) => void;
}

export function ArticleLinkDialog({ isOpen, onOpenChange, onSelectLink }: ArticleLinkDialogProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<StandaloneArticle[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getBooks().then(setBooks);
      getStandaloneArticles().then(setArticles);
    }
  }, [isOpen]);

  const handleBookSelect = async (bookId: string) => {
    setLoading(true);
    const content = await getBookContent(bookId);
    setSelectedBook(content);
    setLoading(false);
  };

  const handleLinkSelect = (url: string) => {
    onSelectLink(url);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[70vh] flex flex-col">
        <DialogHeader><DialogTitle>Link to another article</DialogTitle></DialogHeader>
        <Tabs defaultValue="book" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="book">Book Chapter</TabsTrigger>
            <TabsTrigger value="standalone">Standalone Article</TabsTrigger>
          </TabsList>
          <TabsContent value="book" className="flex-1 overflow-y-auto">
            <div className="flex gap-4">
              <ScrollArea className="h-[50vh] w-1/3">
                {books.map(book => (
                    <Button key={book.id} variant="ghost" className="w-full justify-start" onClick={() => handleBookSelect(book.id)}>
                        {book.name}
                    </Button>
                ))}
              </ScrollArea>
              <ScrollArea className="h-[50vh] w-2/3">
                {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div> 
                         : selectedBook ? (
                             selectedBook.chapters.map(chapter => (
                                <div key={chapter.id} className="mb-2">
                                    <h4 className="font-semibold">{chapter.name}</h4>
                                    {chapter.articles.map(article => (
                                        <Button key={article.verse} variant="ghost" className="w-full justify-start" onClick={() => handleLinkSelect(`/books/${selectedBook.bookId}?verse=${article.verse}`)}>
                                            Verse {article.verse} - {article.title}
                                        </Button>
                                    ))}
                                </div>
                             ))
                         ) : <p className="text-muted-foreground">Select a book to see its chapters.</p>}
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="standalone" className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
                {articles.map(article => (
                    <Button key={article.id} variant="ghost" className="w-full justify-start" onClick={() => handleLinkSelect(`/articles/${article.id}`)}>
                        {article.title}
                    </Button>
                ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// --- Image Dialog ---
interface ImageDialogProps {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ editor, isOpen, onOpenChange }: ImageDialogProps) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');

  const addImage = () => {
    if (src) {
      editor.chain().focus().setImage({ src, alt, title }).run()
      onOpenChange(false);
      setSrc('');
      setAlt('');
      setTitle('');
    }
  }

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Add an image from a URL.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Image URL" />
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={addImage}>Insert Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
