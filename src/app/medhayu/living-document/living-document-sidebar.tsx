
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, StickyNote, Layers, Eye, Compass, Search, ChevronDown, ChevronRight, Globe, BookOpen, Columns, Palette, Sparkles, Printer, ChevronLeft, Minus, Plus, RefreshCw, NotebookText, PanelLeft, GalleryVertical } from 'lucide-react';
import type { Article, Bookmark, Comment, LayerAnnotation, GlossaryTerm, GlossaryCategory, Book, BookContent, Chapter, Article as ArticleType } from '@/types';
import { ALL_COMMENTARY_TYPES } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Transliterate, useTransliteration } from '@/components/transliteration-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SharePopover } from '@/components/medhayu/Article renderer/share-popover';
import { BookmarkButton } from '@/components/bookmark-button';
import { PrintDialog } from '@/components/medhayu/Article renderer/print-dialog';
import { ArticleTocDisplay } from '@/components/admin/article-toc-display';
import { getBookmarksForUser } from '@/services/user.service';
import { getGlossaryData } from '@/services/glossary.service';
import { motion, AnimatePresence } from 'framer-motion';
import { ScriptSwitcher } from '@/components/medhayu/Article renderer/script-switcher';


// Notes Tab Content
function NotesTab({ article, userId, onHighlight }: { article: Article, userId: string, onHighlight: (id: string) => void }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!article) return;
        setLoading(true);
        getBookmarksForUser(userId).then(allBookmarks => {
            if (!allBookmarks) {
                setBookmarks([]);
                setLoading(false);
                return;
            }
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
                <div key={bookmark.id} className="p-3 rounded-md bg-background border hover:bg-muted/50 cursor-pointer" onClick={() => bookmark.blockId && onHighlight(bookmark.blockId)}>
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
      setCategories(data || []);
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

  const colorMap: { [key: string]: string } = {
    saffron: 'bg-primary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

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
                        <Label className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Globe className="h-3 w-3"/> Global Glossaries
                        </Label>
                        {globalGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={cat.id} />
                                <Label htmlFor={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                     <span className={cn("h-3 w-3 rounded-full", colorMap[cat.colorTheme])}></span>
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                         <Separator />
                         <Label className="flex items-center gap-2 text-muted-foreground text-xs">
                            Local Glossaries
                        </Label>
                         {localGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={cat.id} />
                                <Label htmlFor={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <span className={cn("h-3 w-3 rounded-full", colorMap[cat.colorTheme])}></span>
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
  hasCommentaries,
  isGlossaryMode,
  onGlossaryModeChange
}: {
  layout: 'single' | 'two' | 'three';
  onLayoutChange: (layout: 'single' | 'two' | 'three') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  hasCommentaries: boolean;
  isGlossaryMode: boolean;
  onGlossaryModeChange: (enabled: boolean) => void;
}) {
    const { targetScript, setTargetScript } = useTransliteration();

  return (
    <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
            <h4 className="font-semibold text-base">Display & Appearance</h4>
            <div className="flex items-center justify-around gap-4 p-2 border rounded-lg flex-wrap">
                <div className="flex flex-col items-center gap-1">
                     <Label className="text-xs">Layout</Label>
                    <ToggleGroup type="single" value={layout} onValueChange={(value) => { if (value) onLayoutChange(value as any); }}>
                        <ToggleGroupItem value="single" aria-label="Single Pane"><PanelLeft className="h-4 w-4"/></ToggleGroupItem>
                        <ToggleGroupItem value="two" aria-label="Two Panes" disabled={!hasCommentaries}><Columns className="h-4 w-4"/></ToggleGroupItem>
                        <ToggleGroupItem value="three" aria-label="Three Panes" disabled={!hasCommentaries}><GalleryVertical className="h-4 w-4"/></ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <Separator orientation="vertical" className="h-14 hidden sm:block" />
                <FontSizeSwitcher onFontSizeChange={onFontSizeChange} fontSize={fontSize} />
            </div>
             <div className="flex items-center justify-between p-2 border rounded-lg">
                <Label>Script</Label>
                <ScriptSwitcher />
            </div>
             <div className="flex items-center justify-between p-2 border rounded-lg">
                <Label>Glossary Highlighting</Label>
                <Switch checked={isGlossaryMode} onCheckedChange={onGlossaryModeChange} />
            </div>
        </div>
    </ScrollArea>
  );
}

function FontSizeSwitcher({ onFontSizeChange, fontSize }: { onFontSizeChange: (size: number) => void; fontSize: number; }) {
    const handleFontSizeChange = (change: number) => {
        if (change === 0) {
            onFontSizeChange(18); // Reset to default
        } else {
            onFontSizeChange(Math.max(12, Math.min(32, fontSize + change)));
        }
    };
    return (
         <div className="flex flex-col items-center gap-1">
            <Label className="text-xs flex items-center gap-2">
                Font Size: <span className="font-semibold">{fontSize}px</span>
            </Label>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => handleFontSizeChange(-1)} disabled={fontSize <= 12} aria-label="Decrease font size"><Minus className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => handleFontSizeChange(0)} aria-label="Reset font size"><RefreshCw className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" onClick={() => handleFontSizeChange(1)} disabled={fontSize >= 28} aria-label="Increase font size"><Plus className="h-4 w-4" /></Button>
            </div>
        </div>
    );
}

const NavigatorTabContent = ({ bookContent, onSelectUnit, isLoading, tocContentHtml, onClose, onHighlight, currentArticle }: {
    bookContent: BookContent | null;
    onSelectUnit: (chapter: Chapter, unit: Article) => void;
    isLoading: boolean;
    tocContentHtml: string;
    onClose?: () => void;
    onHighlight?: (id: string) => void;
    currentArticle: Article | null;
}) => {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (bookContent?.chapters?.[0]) {
            setOpenItems(prev => ({ ...prev, [String(bookContent.chapters[0].id)]: true }));
        }
    }, [bookContent]);

    const toggleItem = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderChapterTree = useCallback((chapters: Chapter[] | undefined, level = 0): React.ReactNode => {
        if (!chapters) return null;
        return chapters.map(chapter => (
            <div key={String(chapter.id)} style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}>
                <div className="flex items-center gap-1 cursor-pointer py-1 group" onClick={() => toggleItem(String(chapter.id))}>
                    {chapter.children && chapter.children.length > 0 ? (
                        openItems[String(chapter.id)] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : <div className="w-4"/>}
                    <h4 className="font-semibold text-sm flex-1 truncate group-hover:text-primary">{chapter.name}</h4>
                </div>
                {openItems[String(chapter.id)] && (
                    <div className="pl-4 border-l-2 ml-2">
                        {chapter.articles.map((article: Article) => (
                            <div key={String(article.verse)} className="mt-1">
                                <button
                                    onClick={() => onSelectUnit(chapter, article)}
                                    className={cn(
                                        "text-left w-full p-1 rounded-md text-sm hover:bg-muted truncate",
                                        currentArticle?.verse === article.verse && currentArticle?.title === article.title ? 'bg-muted font-medium' : 'text-muted-foreground'
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
    }, [openItems, currentArticle, onSelectUnit]);

    return (
        <ScrollArea className="flex-1">
            <div className="p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                    </div>
                ) : bookContent && bookContent.chapters ? (
                    renderChapterTree(bookContent.chapters)
                ) : (
                    <div className="text-center text-muted-foreground p-4">Select a book to begin.</div>
                )}
            </div>
        </ScrollArea>
    );
};


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
    onHighlight,
    onClose
}: { 
    books: Book[],
    selectedBookId: string | null,
    onSelectBook: (bookId: string) => void,
    bookContent: BookContent | null,
    onSelectUnit: (chapter: Chapter, unit: Article) => void;
    search: string;
    setSearch: (s: string) => void;
    isLoading: boolean;
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
    onHighlight: (id: string) => void;
    onClose: () => void;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('navigate');

    const isOpen = !isSidebarCollapsed;

    const tabs = [
        { id: 'navigate', icon: Compass, label: 'Navigate' },
        { id: 'notes', icon: StickyNote, label: 'Notes', disabled: !selectedUnit },
        { id: 'layers', icon: Layers, label: 'Layers', disabled: !selectedUnit },
        { id: 'glossary', icon: NotebookText, label: 'Glossary' },
        { id: 'view', icon: Eye, label: 'View' },
    ];
    
    const hasCommentaries = useMemo(() => (selectedUnit?.content || []).some(block => ALL_COMMENTARY_TYPES.includes(block.type)), [selectedUnit]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'navigate': return <NavigatorTabContent 
                bookContent={bookContent}
                onSelectUnit={onSelectUnit}
                isLoading={isLoading}
                tocContentHtml={tocContentHtml}
                onHighlight={onHighlight}
                onClose={onClose}
                currentArticle={selectedUnit}
            />;
            case 'notes': return <ScrollArea className="h-full"><div className="p-4">{selectedUnit && <NotesTab article={selectedUnit} userId="default-user" onHighlight={onHighlight} />}</div></ScrollArea>;
            case 'layers': return <ScrollArea className="h-full"><div className="p-4">{selectedUnit && <LayersTab article={selectedUnit} />}</div></ScrollArea>;
            case 'glossary': return <GlossaryTab activeGlossary={activeGlossary} onActiveGlossaryChange={onActiveGlossaryChange} />;
            case 'view': return <ViewSettingsTab layout={layout} onLayoutChange={onLayoutChange} fontSize={fontSize} onFontSizeChange={onFontSizeChange} hasCommentaries={hasCommentaries} isGlossaryMode={!!activeGlossary} onGlossaryModeChange={(enabled) => onActiveGlossaryChange(enabled ? activeGlossary || {id: 'vedanta-terms', name: 'Vedanta Terms', scope: 'global', colorTheme: 'saffron', terms: []} : null)} />;
            default: return null;
        }
    }
    
    return (
        <aside className={cn(
            "h-full bg-card/50 flex flex-col flex-shrink-0 border-l relative transition-all duration-300 no-print",
            isOpen ? "w-72" : "w-0 border-l-0"
        )}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isOpen)}
              className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full h-8 w-8 z-10 bg-background hover:bg-muted"
              title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <AnimatePresence>
            {isOpen && (
                <motion.div 
                    key="sidebar-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full w-full"
                >
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold truncate">MEDHAYU Reader</h2>
                    </div>
                     <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <div className="px-1 pt-1 border-b">
                             <ScrollArea className="w-full whitespace-nowrap">
                                <TabsList className="inline-flex h-auto p-0 bg-transparent">
                                {tabs.map(tab => (
                                    <TabsTrigger key={tab.id} value={tab.id} title={tab.label} disabled={tab.disabled} className={cn("flex-col h-auto p-2 gap-1 text-xs")}>
                                        <tab.icon className="h-5 w-5" />
                                        {isOpen && <span>{tab.label}</span>}
                                    </TabsTrigger>
                                ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" className="invisible" />
                            </ScrollArea>
                        </div>
                        
                        {activeTab === 'navigate' && (
                             <div className="px-4 pt-4 border-b">
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
                                <div className="relative mt-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search document..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                    
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
                            <PrintDialog articleInfo={articleInfo}>
                                <Button variant="ghost" size="icon" title="Print">
                                    <Printer className="h-5 w-5" />
                                </Button>
                            </PrintDialog>
                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </aside>
    );
}
