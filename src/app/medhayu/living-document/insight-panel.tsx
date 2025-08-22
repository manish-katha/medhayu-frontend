
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, StickyNote, MessageSquare, Layers, NotebookText, Eye, Compass, Search, ChevronDown, ChevronRight, Globe, BookOpen, Columns, Palette, Sparkles, Printer } from 'lucide-react';
import { getBookmarksForUser, type Article, type Bookmark, type Comment, type LayerAnnotation, getGlossaryData, type GlossaryTerm, type GlossaryCategory, type Book, getBookContent, type BookContent as BookContentType, type Chapter, type Article as ArticleType } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Transliterate } from '@/components/transliteration-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { ScriptSwitcher } from '@/components/script-switcher';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SharePopover } from '@/components/share-popover';
import { BookmarkButton } from '@/components/bookmark-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


function ArticleTocDisplay({ contentHtml, onClose }: { contentHtml: string; onClose: () => void }) {
    const [toc, setToc] = React.useState<any[]>([]);
    
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${contentHtml}</div>`, 'text/html');
        const nodes = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, span[data-toc-mark]');
        const newToc: any[] = [];
        let markCounter = 0;

        nodes.forEach(node => {
            const element = node as HTMLElement;
            if (element.tagName.startsWith('H')) {
                 newToc.push({
                    id: element.id,
                    level: parseInt(element.tagName.substring(1), 10),
                    text: element.textContent || '',
                    isMark: false,
                });
            } else if (element.hasAttribute('data-toc-mark')) {
                newToc.push({
                    id: `mark-${markCounter}`,
                    level: 7,
                    text: element.textContent || '',
                    isMark: true,
                    markIndex: markCounter++,
                });
            }
        });
        setToc(newToc);
    }, [contentHtml]);

    const handleScroll = (id: string, isMark: boolean, markIndex?: number) => {
        onClose(); // Close pane on navigation
        const contentArea = document.querySelector('.printable-content');
        if (!contentArea) return;

        setTimeout(() => {
             if (isMark && markIndex !== undefined) {
                const marks = contentArea.querySelectorAll('span[data-toc-mark]');
                marks[markIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                 const element = document.getElementById(id);
                 if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }
            }
        }, 300); // Delay to allow pane to close
    };

    if (toc.length === 0) {
        return <p className="text-sm text-muted-foreground p-4 text-center">No headings or marked entries in this article.</p>;
    }

    return (
        <div className="p-2 space-y-2">
            <h4 className="font-semibold px-2">Table of Contents</h4>
            <ul className="space-y-1">
                {toc.map((item, index) => (
                    <li key={`${item.id}-${index}`} style={{ paddingLeft: `${(item.isMark ? item.level-6 : item.level - 1) * 1}rem` }}>
                        <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScroll(item.id, item.isMark, item.markIndex)}
                            className="text-left justify-start h-auto py-1 text-muted-foreground hover:text-primary w-full text-ellipsis overflow-hidden whitespace-nowrap"
                            title={item.text}
                        >
                           {item.text}
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Notes Tab Content
function NotesTab({ article, userId }: { article: Article, userId: string }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!article) return;
        setLoading(true);
        getBookmarksForUser(userId).then(allBookmarks => {
            const articleBlockIds = new Set(article.content.map(b => b.id));
            const relevantBookmarks = allBookmarks.filter(b => b.type === 'block' && b.blockId && articleBlockIds.has(b.blockId) && b.note);
            setBookmarks(relevantBookmarks);
            setLoading(false);
        });
    }, [article, userId]);

    if (loading) return <div className="flex justify-center items-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
    if (bookmarks.length === 0) return <p className="text-sm text-center text-muted-foreground p-4">You have no private notes for this article.</p>;
    
    return (
        <div className="space-y-3">
            {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="p-3 rounded-md bg-background border">
                     <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground italic">
                       <Transliterate>{bookmark.blockTextPreview}...</Transliterate>
                    </blockquote>
                    <p className="text-sm mt-2">{bookmark.note}</p>
                </div>
            ))}
        </div>
    );
}

// Threads Tab Content
function Thread({ comment }: { comment: Comment }) {
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{comment.authorId.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{comment.authorId}</p>
                {comment.title && <p className="font-medium"><Transliterate>{comment.title}</Transliterate></p>}
                <p className="text-sm text-muted-foreground"><Transliterate>{comment.body}</Transliterate></p>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="pt-2 pl-4 border-l space-y-3">
                        {comment.replies.map(reply => <Thread key={reply.id} comment={reply} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
function ThreadsTab({ article }: { article: Article }) {
    if (!article.comments || article.comments.length === 0) {
        return <p className="text-sm text-center text-muted-foreground p-4">No public threads on this article yet.</p>;
    }
    return (
        <div className="space-y-4">
            {article.comments.map(comment => <Thread key={comment.id} comment={comment} />)}
        </div>
    );
}

// Layers Tab Content
function LayersTab({ article }: { article: Article }) {
    const layersByBlock = article.content.flatMap(block => 
        (block.layers || []).map(layer => ({ ...layer, blockId: block.id, blockSanskrit: block.sanskrit.substring(0, 50) }))
    );

    if (layersByBlock.length === 0) return <p className="text-sm text-center text-muted-foreground p-4">No layers found on this article.</p>;

    return (
        <div className="space-y-3">
            {layersByBlock.map(layer => (
                 <div key={layer.id} className="p-3 rounded-md bg-background border">
                    <p className="text-xs text-muted-foreground">
                       <Transliterate> Layer on "<span className="italic">{layer.blockSanskrit}...</span>"</Transliterate>
                    </p>
                    <p className="text-sm mt-1"><Transliterate>{layer.content}</Transliterate></p>
                </div>
            ))}
        </div>
    );
}

// Glossary Tab Content
function GlossaryTab({
  activeGlossary,
  onActiveGlossaryChange,
}: {
  activeGlossary: GlossaryCategory | null;
  onActiveGlossaryChange: (category: GlossaryCategory | null) => void;
}) {
  const [categories, setCategories] = useState<GlossaryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlossaryData().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);
  
  const globalGlossaries = categories.filter(c => c.scope === 'global');
  const localGlossaries = categories.filter(c => c.scope === 'local');
  
  const handleRadioChange = (value: string) => {
    const found = categories.find(c => c.id === value);
    onActiveGlossaryChange(found || null);
  };
  
  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      if (!activeGlossary && categories.length > 0) {
        onActiveGlossaryChange(categories[0]);
      } else if (!activeGlossary && categories.length === 0) {
        onActiveGlossaryChange(null);
      }
    } else {
      onActiveGlossaryChange(null);
    }
  };

  const colorClassMap: Record<string, string> = {
    saffron: 'bg-primary',
    blue: 'bg-info',
    green: 'bg-success',
    gray: 'bg-muted-foreground',
  };

  const isGlossaryModeOn = activeGlossary !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
            <Label htmlFor="glossary-mode-toggle" className="font-semibold">Glossary Highlighting</Label>
            <Switch
                id="glossary-mode-toggle"
                checked={isGlossaryModeOn}
                onCheckedChange={handleSwitchChange}
            />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
          <p className="text-sm text-muted-foreground mb-4">Select a glossary to highlight its terms in the text.</p>
          {loading ? (
               <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading glossaries...</span>
              </div>
          ) : (
             <RadioGroup 
                onValueChange={handleRadioChange} 
                value={activeGlossary?.id || ''}
                disabled={!isGlossaryModeOn}
                className={cn(!isGlossaryModeOn && "opacity-50")}
            >
                <ScrollArea className="pr-2">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4"/> Global Glossaries
                        </Label>
                        {globalGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={cat.id} />
                                <Label htmlFor={cat.id} className="flex items-center gap-2 cursor-pointer">
                                     <span className={cn("h-3 w-3 rounded-full", colorClassMap[cat.colorTheme])}></span>
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                         <Separator />
                         <Label className="flex items-center gap-2 text-muted-foreground">
                            Local Glossaries
                        </Label>
                         {localGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={cat.id} />
                                <Label htmlFor={cat.id} className="flex items-center gap-2 cursor-pointer">
                                    <span className={cn("h-3 w-3 rounded-full", colorClassMap[cat.colorTheme])}></span>
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
             </RadioGroup>
          )}
      </div>
    </div>
  );
}

function ViewSettingsTab({
  layout,
  onLayoutChange,
  fontSize,
  onFontSizeChange,
}: {
  layout: 'single' | 'two' | 'three';
  onLayoutChange: (layout: 'single' | 'two' | 'three') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label>Layout</Label>
        <ToggleGroup
          type="single"
          value={layout}
          onValueChange={(value) => { if (value) onLayoutChange(value as any); }}
          className="grid grid-cols-3"
        >
          <ToggleGroupItem value="single">Single</ToggleGroupItem>
          <ToggleGroupItem value="two">Two</ToggleGroupItem>
          <ToggleGroupItem value="three">Three</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <Label>Font Size: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          onValueChange={([val]) => onFontSizeChange(val)}
          min={12}
          max={28}
          step={1}
        />
      </div>
      <div className="flex items-center justify-between">
            <Label>Script</Label>
            <ScriptSwitcher />
      </div>
    </div>
  );
}

function NavigatorTab({
  books,
  selectedBookId,
  onSelectBook,
  bookContent,
  onSelectUnit,
  search,
  setSearch,
  isLoading,
  tocContentHtml,
}: {
  books: Book[],
  selectedBookId: string | null,
  onSelectBook: (bookId: string) => void,
  bookContent: BookContentType | null,
  onSelectUnit: (unit: Article) => void,
  search: string,
  setSearch: (s: string) => void,
  isLoading: boolean,
  tocContentHtml: string
}) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Automatically open the first chapter when book content loads
    if (bookContent?.chapters?.[0]) {
        setOpenItems(prev => ({ ...prev, [String(bookContent.chapters[0].id)]: true }));
    }
  }, [bookContent]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderChapterTree = (chapters: Chapter[], level = 0) => {
    return chapters.map(chapter => (
      <div key={String(chapter.id)} style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}>
        <div
          className="flex items-center gap-1 cursor-pointer py-1"
          onClick={() => toggleItem(String(chapter.id))}
        >
          {openItems[String(chapter.id)] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <h4 className="font-semibold text-sm flex-1 truncate">{chapter.name}</h4>
        </div>
        {openItems[String(chapter.id)] && (
          <div className="pl-4 border-l-2 ml-2">
            {chapter.articles.map((article: Article) => (
              <div key={String(article.verse)} className="mt-1">
                <button onClick={() => bookContent && onSelectUnit(article)} className="text-left w-full p-1 rounded-md text-sm hover:bg-muted truncate">
                  Verse {article.verse}
                </button>
              </div>
            ))}
            {chapter.children && renderChapterTree(chapter.children, level + 1)}
          </div>
        )}
      </div>
    ));
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="space-y-4">
            <Select onValueChange={onSelectBook} value={selectedBookId || ''}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a book..." />
                </SelectTrigger>
                <SelectContent>
                    {books.map(book => (
                        <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search document..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
            {tocContentHtml && <>
              <ArticleTocDisplay contentHtml={tocContentHtml} onClose={() => {}} />
              <Separator className="my-4" />
            </>}
            {isLoading ? (
            <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
            ) : bookContent ? (
                renderChapterTree(bookContent.chapters)
            ) : (
                <div className="text-center text-muted-foreground p-4">Select a book to begin.</div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}


export function LivingDocumentSidebar({ 
    books,
    selectedBookId,
    onSelectBook,
    bookContent,
    onSelectUnit,
    search,
    setSearch,
    isLoading,
    selectedUnit,
    activeGlossary,
    onActiveGlossaryChange,
    layout,
    onLayoutChange,
    fontSize,
    onFontSizeChange,
    tocContentHtml,
    articleInfo,
    isArticleBookmarked,
}: { 
    books: Book[],
    selectedBookId: string | null,
    onSelectBook: (bookId: string) => void,
    bookContent: BookContentType | null,
    onSelectUnit: (unit: Article) => void,
    search: string,
    setSearch: (s: string) => void,
    isLoading: boolean,
    selectedUnit: Article | null;
    activeGlossary: GlossaryCategory | null;
    onActiveGlossaryChange: (category: GlossaryCategory | null) => void;
    layout: 'single' | 'two' | 'three';
    onLayoutChange: (layout: 'single' | 'two' | 'three') => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    tocContentHtml: string,
    articleInfo: { book: BookContent; chapter: Chapter; article: Article; } | null,
    isArticleBookmarked: boolean,
}) {
    const [isOpen, setIsOpen] = useState(true);

    const tabs = [
        { id: 'navigate', icon: Compass, label: 'Navigate' },
        { id: 'notes', icon: StickyNote, label: 'Notes', disabled: !selectedUnit },
        { id: 'threads', icon: MessageSquare, label: 'Threads', disabled: !selectedUnit },
        { id: 'layers', icon: Layers, label: 'Layers', disabled: !selectedUnit },
        { id: 'glossary', icon: NotebookText, label: 'Glossary' },
        { id: 'view', icon: Eye, label: 'View' },
    ];

    return (
        <aside className={cn(
            "h-full bg-card/50 flex flex-col flex-shrink-0 border-l relative transition-all duration-300",
            isOpen ? "w-80" : "w-[52px]"
        )}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full h-8 w-8 z-10 bg-background hover:bg-muted"
                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <div className="p-4 border-b">
                <h2 className={cn("text-xl font-bold truncate", !isOpen && "sr-only")}>GranthaDNA Reader</h2>
            </div>

            <div className="flex-1 min-h-0">
                <Tabs defaultValue="navigate" className="h-full flex flex-col">
                    <TabsList className={cn("grid w-full flex-shrink-0 p-1 h-auto", isOpen ? "grid-cols-3" : "grid-cols-1")}>
                         {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} title={tab.label} disabled={tab.disabled} className={cn("flex gap-2", !isOpen && "justify-center")}>
                                <tab.icon className="h-4 w-4" />
                                {isOpen && <span>{tab.label}</span>}
                            </TabsTrigger>
                         ))}
                    </TabsList>
                    
                    <TabsContent value="navigate" className="flex-1 m-0">
                        <NavigatorTab 
                            books={books}
                            selectedBookId={selectedBookId}
                            onSelectBook={onSelectBook}
                            bookContent={bookContent}
                            onSelectUnit={onSelectUnit}
                            search={search}
                            setSearch={setSearch}
                            isLoading={isLoading}
                            tocContentHtml={tocContentHtml}
                        />
                    </TabsContent>
                    <TabsContent value="notes" className="flex-1 m-0">
                         <ScrollArea className="h-full">
                            <div className="p-4">
                                {selectedUnit && <NotesTab article={selectedUnit} userId="default-user" />}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="threads" className="flex-1 m-0">
                         <ScrollArea className="h-full">
                            <div className="p-4">
                                 {selectedUnit && <ThreadsTab article={selectedUnit} />}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="layers" className="flex-1 m-0">
                         <ScrollArea className="h-full">
                            <div className="p-4">
                                {selectedUnit && <LayersTab article={selectedUnit} />}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                     <TabsContent value="glossary" className="m-0 flex-1 flex flex-col min-h-0">
                        <GlossaryTab 
                            activeGlossary={activeGlossary}
                            onActiveGlossaryChange={onActiveGlossaryChange}
                        />
                    </TabsContent>
                    <TabsContent value="view" className="flex-1 m-0">
                        <ViewSettingsTab
                            layout={layout}
                            onLayoutChange={onLayoutChange}
                            fontSize={fontSize}
                            onFontSizeChange={onFontSizeChange}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            {isOpen && articleInfo && (
                 <div className="p-2 border-t mt-auto flex items-center justify-around flex-shrink-0">
                    <BookmarkButton
                        isBookmarked={isArticleBookmarked}
                        type="article"
                        book={articleInfo.book}
                        chapter={articleInfo.chapter}
                        article={articleInfo.article}
                        size="icon"
                    />
                    <SharePopover />
                    <Button variant="ghost" size="icon" onClick={() => window.print()} title="Print">
                        <Printer className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </aside>
    );
}
