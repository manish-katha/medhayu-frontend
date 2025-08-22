
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ScriptSwitcher } from './script-switcher';
import { BookmarkButton } from '@/components/bookmark-button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { BookContent, Chapter, Article } from '@/lib/data-service';
import { BookOpen, Columns, Palette, Sparkles, Printer, Share2, Copy } from 'lucide-react';

// --- Sub-components for Pane Content ---

const TableOfContents = ({ contentHtml, onClose }: { contentHtml: string; onClose: () => void }) => {
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

const LayoutSettings = ({ layout, onLayoutChange }: { layout: string; onLayoutChange: (l: any) => void; }) => (
    <div className="p-4 space-y-4">
        <h4 className="font-semibold">Display Layout</h4>
        <ToggleGroup type="single" value={layout} onValueChange={(value) => { if (value) onLayoutChange(value as any) }} className="w-full grid grid-cols-3">
            <ToggleGroupItem value="single" aria-label="Single Pane">Single</ToggleGroupItem>
            <ToggleGroupItem value="two" aria-label="Two Panes">Two</ToggleGroupItem>
            <ToggleGroupItem value="three" aria-label="Three Panes">Three</ToggleGroupItem>
        </ToggleGroup>
    </div>
);

const AppearanceSettings = ({ fontSize, onFontSizeChange }: { fontSize: number; onFontSizeChange: (s: number) => void; }) => (
    <div className="p-4 space-y-6">
        <h4 className="font-semibold">Appearance</h4>
        <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-between">
            <Label>Script</Label>
            <ScriptSwitcher />
        </div>
        <div className="space-y-2">
            <Label>Font Size: {fontSize}px</Label>
            <Slider value={[fontSize]} onValueChange={([val]) => onFontSizeChange(val)} min={12} max={28} step={1} />
        </div>
    </div>
);

const EnhancementSettings = ({ isGlossaryMode, onGlossaryModeChange }: { isGlossaryMode: boolean; onGlossaryModeChange: (e: boolean) => void; }) => (
     <div className="p-4 space-y-4">
        <h4 className="font-semibold">Enhancements</h4>
        <div className="flex items-center justify-between">
            <Label htmlFor="glossary-mode">Glossary Mode</Label>
            <Switch id="glossary-mode" checked={isGlossaryMode} onCheckedChange={onGlossaryModeChange} />
        </div>
    </div>
);

const ShareContent = () => {
    const [url, setUrl] = React.useState('');
    const { toast } = useToast();

    React.useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        toast({ title: 'Copied to Clipboard' });
    };

    return (
        <div className="p-4 space-y-4">
             <h4 className="font-semibold">Share Article</h4>
            <div className="flex items-center space-x-2">
                <Input id="link" value={url} readOnly className="h-8" />
                <Button size="icon" className="h-8 w-8" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};


// --- Main Pane Component ---

export function FloatingWidgetsPane({
    isOpen,
    onClose,
    tocContentHtml,
    layout, onLayoutChange,
    fontSize, onFontSizeChange,
    isGlossaryMode, onGlossaryModeChange,
    isArticleBookmarked,
    articleInfo,
}: {
    isOpen: boolean;
    onClose: () => void;
    tocContentHtml: string;
    layout: 'single' | 'two' | 'three';
    onLayoutChange: (layout: 'single' | 'two' | 'three') => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    isGlossaryMode: boolean;
    onGlossaryModeChange: (enabled: boolean) => void;
    isArticleBookmarked: boolean;
    articleInfo: { book: BookContent, chapter: Chapter, article: Article };
}) {

    const tools = [
        { id: 'toc', icon: BookOpen, tooltip: 'Table of Contents', content: <TableOfContents contentHtml={tocContentHtml} onClose={onClose} /> },
        { id: 'layout', icon: Columns, tooltip: 'Layout', content: <LayoutSettings layout={layout} onLayoutChange={onLayoutChange} /> },
        { id: 'appearance', icon: Palette, tooltip: 'Appearance', content: <AppearanceSettings fontSize={fontSize} onFontSizeChange={onFontSizeChange} /> },
        { id: 'enhancements', icon: Sparkles, tooltip: 'Enhancements', content: <EnhancementSettings isGlossaryMode={isGlossaryMode} onGlossaryModeChange={onGlossaryModeChange} /> },
        { id: 'print', icon: Printer, tooltip: 'Print', action: () => window.print() },
        { id: 'share', icon: Share2, tooltip: 'Share', content: <ShareContent /> },
    ];

    const barVariants = {
        hidden: { x: '100%', opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
        exit: { x: '100%', opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                 <motion.div
                    key="widget-bar"
                    variants={barVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed top-0 right-0 h-full w-[60px] bg-accent/80 backdrop-blur-sm border-l border-border/20 flex flex-col items-center justify-center z-40 no-print"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div 
                        className="flex flex-col gap-4"
                        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
                        initial="hidden"
                        animate="visible"
                    >
                        {tools.map(tool => (
                             <motion.div key={tool.id} variants={itemVariants}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             {tool.content ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="icon" className="rounded-full bg-background/50 border-foreground/20 hover:bg-background h-11 w-11">
                                                            <tool.icon className="h-5 w-5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent side="left" className="w-80 p-0">
                                                        {tool.content}
                                                    </PopoverContent>
                                                </Popover>
                                             ) : (
                                                 <Button 
                                                    variant="outline"
                                                    size="icon"
                                                    className={cn(
                                                        "rounded-full bg-background/50 border-foreground/20 hover:bg-background h-11 w-11"
                                                    )}
                                                    onClick={tool.action}
                                                 >
                                                    <tool.icon className="h-5 w-5" />
                                                </Button>
                                             )}
                                        </TooltipTrigger>
                                        <TooltipContent side="left"><p>{tool.tooltip}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        ))}
                         <motion.div variants={itemVariants}>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <BookmarkButton
                                            isBookmarked={isArticleBookmarked}
                                            type="article"
                                            book={articleInfo.book}
                                            chapter={articleInfo.chapter}
                                            article={articleInfo.article}
                                            size="icon"
                                            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), "rounded-full bg-background/50 border-foreground/20 hover:bg-background h-11 w-11")}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="left"><p>Bookmark Article</p></TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

    