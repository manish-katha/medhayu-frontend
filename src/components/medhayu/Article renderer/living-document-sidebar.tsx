
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, StickyNote, Layers, Eye, Compass, Search, ChevronDown, ChevronRight, Globe, BookOpen, Columns, Palette, Sparkles, Printer, ChevronLeft, NotebookText, PanelLeft, GalleryVertical } from 'lucide-react';
import type { Article, Bookmark, Comment, LayerAnnotation, GlossaryTerm, GlossaryCategory, Book, BookContent, Chapter, Article as ArticleType } from '@/types';
import { cn } from '@/lib/utils';
import { Transliterate, useTransliteration } from '@/components/transliteration-provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SharePopover } from '@/components/share-popover';
import { BookmarkButton } from '@/components/bookmark-button';
import { PrintDialog } from '@/components/print-dialog';
import { ArticleTocDisplay } from '@/components/admin/article-toc-display';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getBookmarksForUser } from '@/services/user.service';
import { getGlossaryData } from '@/services/glossary.service';
import { SCRIPT_DEFINITIONS } from '@/components/transliteration-provider';
import { addBookmark } from '@/actions/bookmark.actions';


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
                         <Label className="flex items-center gap-2 text-muted-foreground">
                            Local Glossaries
                        </Label>
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
    const { targetScript, setTargetScript } = useTransliteration();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-around gap-4 p-2 border rounded-lg flex-wrap">
        <div className="flex flex-col items-center gap-1">
          <Label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs">Layout</Label>
          <ToggleGroup
            type="single"
            value={layout}
            onValueChange={(value) => { if (value) onLayoutChange(value as any); }}
            className="h-10"
          >
            <ToggleGroupItem value="single" aria-label="Single Pane"><PanelLeft className="h-4 w-4"/></ToggleGroupItem>
            <ToggleGroupItem value="two" aria-label="Two Panes"><Columns className="h-4 w-4"/></ToggleGroupItem>
            <ToggleGroupItem value="three" aria-label="Three Panes" disabled><GalleryVertical className="h-4 w-4"/></ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Separator orientation="vertical" className="h-14 hidden sm:block" />
        <div className="flex flex-col items-center gap-1">
          <Label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs flex items-center gap-2">Font Size: <span className="font-semibold">{fontSize}px</span></Label>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="w-8 h-8 p-0" onClick={() => onFontSizeChange(fontSize - 1)} disabled={fontSize <= 12} aria-label="Decrease font size">A-</Button>
            <Button size="icon" variant="outline" className="w-8 h-8 p-0" onClick={() => onFontSizeChange(18)} aria-label="Reset font size">A</Button>
            <Button size="icon" variant="outline" className="w-8 h-8 p-0" onClick={() => onFontSizeChange(fontSize + 1)} disabled={fontSize >= 28} aria-label="Increase font size">A+</Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
            <Label>Script</Label>
            <Select value={targetScript} onValueChange={setTargetScript}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a script" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(SCRIPT_DEFINITIONS).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
      </div>
    </div>
  );
}

const NavigatorTab = ({
  books,
  selectedBookId,
  onSelectBook,
  bookContent,
  onSelectUnit,
  search,
  setSearch,
  isLoading,
  tocContentHtml,
  currentArticle,
}: {
  books: Book[],
  selectedBookId: string | null,
  onSelectBook: (bookId: string) => void,
  bookContent: BookContent | null,
  onSelectUnit: (chapter: Chapter, unit: Article) => void,
  search: string,
  setSearch: (s: string) => void,
  isLoading: boolean,
  tocContentHtml: string,
  currentArticle: Article | null,
}) => {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (id: string) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderChapterTree = (chapters: Chapter[], level = 0) => {
    return chapters.map(chapter => (
      <div key={chapter.id} style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}>
        <div
          className="flex items-center gap-1 cursor-pointer py-1 group"
          onClick={() => toggleChapter(String(chapter.id))}
        >
          {chapter.children && chapter.children.length > 0 ? (
            openChapters[String(chapter.id)] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : <div className="w-4"/>}
          <h4 className="font-semibold text-sm flex-1 truncate group-hover:text-primary">{chapter.name}</h4>
        </div>
        {openChapters[String(chapter.id)] && (
          <div className="pl-4 border-l-2 ml-2">
            {chapter.articles.map((article: Article) => (
              <div key={article.verse} className="mt-1">
                <button
                  onClick={() => onSelectUnit(chapter, article)}
                  className={cn(
                    "text-left w-full p-1 rounded-md text-sm hover:bg-muted truncate",
                    currentArticle?.verse === article.verse ? 'bg-muted font-medium' : 'text-muted-foreground'
                  )}
                >
                  Verse {article.verse} - {article.title}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : tocContentHtml ? (
            <>
              <ArticleTocDisplay contentHtml={tocContentHtml} onClose={() => {}} />
              <Separator className="my-4" />
              <h4 className="font-semibold px-2 mb-2 text-muted-foreground">Book Index</h4>
              {bookContent && renderChapterTree(bookContent.chapters)}
            </>
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
    bookContent: BookContent | null,
    onSelectUnit: (chapter: Chapter, unit: Article) => void,
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    return (
        <aside className={cn(
            "fixed top-16 right-0 h-[calc(100vh-4rem)] bg-card/50 flex flex-col flex-shrink-0 border-l transition-all duration-300 no-print z-40",
            isSidebarCollapsed ? "w-0 -mr-1" : "w-72"
        )}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full h-8 w-8 z-10 bg-background hover:bg-muted"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            
            <div className={cn("flex flex-col h-full w-full overflow-hidden", isSidebarCollapsed && 'opacity-0 invisible')}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold truncate">GranthaDNA Reader</h2>
                </div>
                 <Tabs defaultValue="navigate" className="flex-1 flex flex-col min-h-0">
                    <div className="px-1 pt-1 border-b">
                         <ScrollArea orientation="horizontal">
                            <TabsList className="inline-flex h-auto p-0 bg-transparent">
                                {['navigate', 'notes', 'layers', 'glossary', 'view'].map(tab => (
                                    <TabsTrigger key={tab} value={tab} title={tab} disabled={tab !== 'navigate' && tab !== 'glossary' && tab !== 'view' && !selectedUnit} className={cn("flex-col h-auto p-2 gap-1 text-xs")}>
                                        {tab === 'navigate' && <Compass className="h-5 w-5"/>}
                                        {tab === 'notes' && <StickyNote className="h-5 w-5"/>}
                                        {tab === 'layers' && <Layers className="h-5 w-5"/>}
                                        {tab === 'glossary' && <NotebookText className="h-5 w-5"/>}
                                        {tab === 'view' && <Eye className="h-5 w-5"/>}
                                        <span className="capitalize">{tab}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="navigate" className="h-full m-0">
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
                                currentArticle={selectedUnit}
                            />
                        </TabsContent>
                         <TabsContent value="notes" className="flex-1 m-0">
                             <ScrollArea className="h-full">
                                <div className="p-4">
                                    {selectedUnit && <NotesTab article={selectedUnit} userId="default-user" />}
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
                    </div>
                </Tabs>
                 <div className="p-2 border-t mt-auto flex items-center justify-around flex-shrink-0">
                    {articleInfo && (
                        <form action={addBookmark}>
                            <input type="hidden" name="userId" value="default-user" />
                            <input type="hidden" name="type" value="article" />
                            <input type="hidden" name="bookId" value={bookContent?.bookId || ''} />
                            <input type="hidden" name="chapterId" value={String(articleInfo.chapter.id) || ''} />
                            <input type="hidden" name="verse" value={String(articleInfo.article.verse) || ''} />
                            <input type="hidden" name="bookName" value={bookContent?.bookName || ''} />
                            <input type="hidden" name="articleTitle" value={articleInfo.article.title || ''} />
                            <BookmarkButton
                                isBookmarked={isArticleBookmarked}
                                type="article"
                                book={articleInfo.book}
                                chapter={articleInfo.chapter}
                                article={articleInfo.article}
                                size="icon"
                            />
                        </form>
                    )}
                    <SharePopover />
                    <PrintDialog articleInfo={articleInfo}>
                        <Button variant="ghost" size="icon" title="Print">
                            <Printer className="h-5 w-5" />
                        </Button>
                    </PrintDialog>
                </div>
            </div>
        </aside>
    );
}
