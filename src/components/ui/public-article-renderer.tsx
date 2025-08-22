
'use client';

import React, { useState, useEffect, useMemo, useCallback, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import parse, { domToReact, type HTMLReactParserOptions, type Element } from 'html-react-parser';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCitationByRefId } from '@/services/citation.service';
import type { Citation as CitationType, GlossaryTerm, ContentBlock, BookContent, Chapter, Article, PostAuthor, Bookmark } from '@/lib/data-service';
import { Loader2, Languages, History, MoreHorizontal, StickyNote, MessageSquare, Layers, Lightbulb, Waypoints, Link2, GitBranch, Sparkles, Star, BadgeCheck, Check } from 'lucide-react';
import { translateText } from '@/ai/flows/translate-text';
import { Transliterate } from './transliteration-provider';
import { ALL_COMMENTARY_TYPES, getTypeLabelById, getSanskritLabelById, getIastLabelById, ALL_SOURCE_TYPES } from '@/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookmarkButton } from './bookmark-button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { SparkDialog, LayerDialog, PointDialog, DriftDialog, NoteDialog } from './interaction-dialogs';
import { handleToggleGlow, saveBlockNote } from '@/app/articles/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArticleMetadataBar } from './article-metadata-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useLanguage, SUPPORTED_LANGUAGES } from './language-provider';
import { useCopilot } from '@/contexts/copilot-context';

// --- Reusable Child Components ---

function VersionWord({ versions }: { versions: string[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    if (!versions || versions.length === 0) return null;

    const activeVersionText = versions[activeIndex] || versions[0];
    
    const handleSelectVersion = (index: number) => {
        setActiveIndex(index);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <span className="version-word" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}>
                    <Transliterate>{activeVersionText}</Transliterate>
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1">
                <div className="space-y-1">
                    <p className="font-semibold text-sm px-2 mb-1">Select Version:</p>
                    {versions.map((version, index) => (
                        <Button
                            key={index}
                            variant={activeIndex === index ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleSelectVersion(index)}
                            className="w-full justify-start font-normal font-devanagari"
                        >
                            <Check className={cn("mr-2 h-4 w-4", activeIndex === index ? 'opacity-100' : 'opacity-0')} />
                            <Transliterate>{version}</Transliterate>
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function PublicCitationTooltip({ refId }: { refId: string }) {
  const [citation, setCitation] = React.useState<CitationType | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  React.useEffect(() => {
    async function fetchCitation() {
      const data = await getCitationByRefId(refId);
      setCitation(data);
    }
    fetchCitation();
  }, [refId]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-primary font-semibold cursor-pointer hover:underline decoration-primary/50 underline-offset-4">
            [[{refId}]]
          </span>
        </TooltipTrigger>
        {isMounted && (
            <TooltipContent className="max-w-sm">
            {citation ? (
                <div className="flex flex-col gap-1">
                    <span className="block font-bold">{citation.source}, {citation.location}</span>
                    <span className="block font-headline text-primary">{citation.sanskrit}</span>
                    <span className="block text-sm text-muted-foreground italic">{citation.translation}</span>
                </div>
            ) : (
                <span className="block">Loading citation...</span>
            )}
            </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

function GlossaryTermTooltip({ term, children, activeGlossaryColor }: { term: GlossaryTerm; children: React.ReactNode; activeGlossaryColor?: string }) {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    const colorClassMap: Record<string, string> = {
      saffron: 'text-primary border-primary/50',
      blue: 'text-info border-info/50',
      green: 'bg-success border-success/50',
      gray: 'text-muted-foreground border-muted-foreground/50',
    };
    const hoverBgClassMap: Record<string, string> = {
      saffron: 'hover:bg-primary/10',
      blue: 'hover:bg-info/10',
      green: 'hover:bg-success/10',
      gray: 'hover:bg-muted/50',
    };
    const colorClass = activeGlossaryColor ? colorClassMap[activeGlossaryColor] : 'text-info border-info/50';
    const hoverClass = activeGlossaryColor ? hoverBgClassMap[activeGlossaryColor] : 'hover:bg-info/10';


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('glossary-term-highlight', colorClass, hoverClass)}>
            {children}
          </span>
        </TooltipTrigger>
        {isMounted && (
            <TooltipContent className="max-w-sm">
                <span className="font-bold font-devanagari block">{term.term}</span>
                {term.transliteration && <span className="italic text-muted-foreground block">{term.transliteration}</span>}
                <span role="separator" className="block my-2 h-px w-full bg-border" />
                <span className="block">{term.definition}</span>
            </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

function PublicNote({ dataType, noteNumber, noteContent }: { dataType: string, noteNumber: number, noteContent: string }) {
    const className = dataType === 'footnote'
        ? 'text-info font-bold select-none text-xs'
        : 'text-destructive font-bold select-none text-xs';

    const content = dataType === 'footnote' ? `[${noteNumber}]` : `[*${noteNumber}]`;
    const noteId = `${dataType}-${noteNumber}`;
    
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <sup className={className}>
                        <a href={`#${noteId}`} id={`ref-${noteId}`} className="no-underline hover:underline">
                            {content}
                        </a>
                    </sup>
                </TooltipTrigger>
                {isMounted && (
                    <TooltipContent>
                        <span dangerouslySetInnerHTML={{ __html: noteContent }} />
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}

function BlockTranslator({ sourceHtml, onTranslate, onReset }: { sourceHtml: string, onTranslate: (t: string) => void, onReset: () => void }) {
    const [isLoading, setIsLoading] = useState<string | null>(null); // Store target language code while loading
    const [isTranslated, setIsTranslated] = useState(false);
    
    const handleTranslate = async (targetLang: string) => {
        setIsLoading(targetLang);
        try {
            const result = await translateText({ text: sourceHtml, targetLang });
            if (result.translation) {
                onTranslate(result.translation);
                setIsTranslated(true);
            }
        } catch (e) {
            console.error("Translation failed", e);
        } finally {
            setIsLoading(null);
        }
    };

    const handleReset = () => {
        setIsTranslated(false);
        onReset();
    };

    if (isTranslated) {
        return (
             <Button variant="ghost" size="icon" title="Show Original" onClick={handleReset} disabled={!!isLoading}>
                <History className="h-4 w-4" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Translate" disabled={!!isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                    <DropdownMenuItem key={lang.code} onSelect={() => handleTranslate(lang.code)} disabled={!!isLoading}>
                        {isLoading === lang.code && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Translate to {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function GlowButton({ articleInfo, block }: {
  articleInfo: { book: BookContent; chapter: Chapter; article: Article };
  block: ContentBlock;
}) {
  const [isPending, startTransition] = React.useTransition();
  const { openCopilotWithContext } = useCopilot();
  const { toast } = useToast();

  const handleClick = () => {
    // This now opens the copilot with the block's content.
    if (block.sanskrit) {
      openCopilotWithContext(block.sanskrit);
    } else {
      toast({
        variant: 'destructive',
        title: 'Cannot Analyze',
        description: 'This block does not contain any text to analyze.',
      });
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} title="Ask AI about this block">
      <Sparkles className="h-5 w-5" />
    </Button>
  );
}

// --- Main Parser and Renderer ---

function HtmlContentParser({ htmlString, isGlossaryMode, glossary, termsRegex, glossaryTermsMap, activeGlossaryColor }: {
    htmlString: string;
    isGlossaryMode: boolean;
    glossary: GlossaryTerm[];
    termsRegex: RegExp | null;
    glossaryTermsMap: Map<string, GlossaryTerm>;
    activeGlossaryColor?: string;
}) {
    if (!htmlString) return null;

    class ParserState {
        footnoteCounter = 0;
        specialnoteCounter = 0;
    }

    const memoizedContent = useMemo(() => {
        if (!htmlString) return null;

        const state = new ParserState();
        
        const hasCustomChild = (children: any[]): boolean => {
            if (!children) return false;
            return children.some(child => {
                if (child.type === 'tag') {
                    if (child.name === 'div' && child.attribs['data-citation-node']) return true;
                    if (child.name === 'span' && (child.attribs['data-citation'] || child.attribs['data-versions'])) return true;
                    if (child.name === 'sup' && child.attribs['data-type']) return true;
                    if (child.children) return hasCustomChild(child.children);
                }
                return false;
            });
        }
        
        const isInsideInteractiveElement = (domNode: Element | any): boolean => {
            let parent = domNode.parent;
            while(parent) {
                if (parent.type === 'tag' && (parent.name === 'a' || parent.name === 'button' || parent.attribs?.['data-citation'] || parent.attribs?.role === 'tooltip' || parent.attribs?.['data-tippy-root'] || parent.classList?.contains('version-word'))) {
                    return true;
                }
                parent = parent.parent;
            }
            return false;
        }

        const hasGlossaryTermRecursive = (nodes: any[]): boolean => {
            if (!isGlossaryMode || !termsRegex) return false;
            for (const node of nodes) {
                if (node.type === 'text' && termsRegex.test(node.data)) {
                    return true;
                }
                if (node.children && hasGlossaryTermRecursive(node.children)) {
                    return true;
                }
            }
            return false;
        };

        const options: HTMLReactParserOptions = {
            replace: (domNode) => {
                if (domNode.type === 'tag') {
                    const node = domNode as Element;
                    
                    if (node.name === 'p' && hasCustomChild(node.children)) {
                        return <div>{domToReact(node.children, options)}</div>;
                    }

                    if (node.name === 'div' && node.attribs['data-citation-node']) {
                        const refId = node.attribs['data-ref-id'];
                        if (refId) {
                            return <PublicCitationTooltip refId={refId} />;
                        }
                    }
                    if (node.name === 'span' && node.attribs['data-versions']) {
                        try {
                            const versions = JSON.parse(node.attribs['data-versions']);
                            return <VersionWord versions={versions} />;
                        } catch (e) {
                            return <span>{domToReact(node.children, options)}</span>; // Fallback
                        }
                    }

                    if (node.name === 'sup' && node.attribs['data-type']) {
                        const dataType = node.attribs['data-type'];
                        const dataContent = node.attribs['data-content'];
                        if (dataType === 'footnote') {
                            const noteNumber = ++state.footnoteCounter;
                            return <PublicNote dataType={dataType} noteNumber={noteNumber} noteContent={dataContent} />;
                        }
                        if (dataType === 'specialnote') {
                            const noteNumber = ++state.specialnoteCounter;
                            return <PublicNote dataType={dataType} noteNumber={noteNumber} noteContent={dataContent} />;
                        }
                    }
                    if (node.name === 'p' && hasGlossaryTermRecursive(node.children)) {
                        return <div>{domToReact(node.children, options)}</div>;
                    }

                    if (node.name === 'blockquote' && node.attribs['data-author']) {
                        const childNodes = domToReact(node.children, options);
                        return (
                            <figure className="my-4">
                                <blockquote className="border-l-4 pl-4 italic">
                                    {childNodes}
                                </blockquote>
                                <figcaption className="text-right text-sm text-muted-foreground mt-1">
                                    — {node.attribs['data-author']}
                                </figcaption>
                            </figure>
                        );
                    }
                }
                
                if (isGlossaryMode && termsRegex && domNode.type === 'text') {
                    const textNode = domNode as any;
                    
                    if (isInsideInteractiveElement(textNode)) {
                        return; // Default behavior
                    }
                    
                    const text = textNode.data;
                    const parts = text.split(termsRegex);
    
                    if (parts.length <= 1) {
                        return; // No match, default behavior
                    }
                    
                    const elements: React.ReactNode[] = [];
                    let matchIndex = 0;

                    parts.forEach((part, i) => {
                        if (i % 2 === 0) {
                            elements.push(part);
                        } else {
                            const term = glossaryTermsMap.get(part);
                            if (term) {
                                elements.push(<GlossaryTermTooltip key={`${i}-${matchIndex++}`} term={term} activeGlossaryColor={activeGlossaryColor}>{part}</GlossaryTermTooltip>);
                            } else {
                                elements.push(part);
                            }
                        }
                    });

                    return <>{elements}</>;
                }
            }
        };

        return parse(htmlString, options);
    }, [htmlString, isGlossaryMode, termsRegex, glossaryTermsMap, activeGlossaryColor]);

    return <>{memoizedContent}</>;
}


function ArticleNotes({ blocks }: { blocks: ContentBlock[] }) {
    const [notes, setNotes] = useState<{ footnotes: string[], specialNotes: string[] }>({ footnotes: [], specialNotes: [] });
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;

        const allFootnotes: string[] = [];
        const allSpecialnotes: string[] = [];
        const parser = new DOMParser();
        
        const allOriginalHtml = blocks.map(b => b.sanskrit).join('');
        if (!allOriginalHtml) {
            setNotes({ footnotes: [], specialNotes: [] });
            return;
        }

        const doc = parser.parseFromString(`<div>${allOriginalHtml}</div>`, 'text/html');
        
        doc.querySelectorAll('sup[data-type="footnote"]').forEach(el => {
            const content = el.getAttribute('data-content');
            if (content) allFootnotes.push(content);
        });
        doc.querySelectorAll('sup[data-type="specialnote"]').forEach(el => {
            const content = el.getAttribute('data-content');
            if (content) allSpecialnotes.push(content);
        });

        setNotes({ footnotes: allFootnotes, specialNotes: allSpecialnotes });
    }, [blocks, isMounted]);

    const { footnotes, specialNotes } = notes;
    const hasNotes = footnotes.length > 0 || specialNotes.length > 0;
    if (!hasNotes) return null;

    return (
        <div className="mt-12 pt-8 border-t">
             <div className="footnotes-container font-devanagari">
                {footnotes.length > 0 && (
                    <div className="space-y-2 md:border-r md:pr-8">
                        <h3 className="font-bold text-lg mb-2 font-headline text-blue-600 dark:text-blue-400">Footnotes</h3>
                        <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                            {footnotes.map((note, index) => (
                                <li key={`fn-${index}`} id={`footnote-${index + 1}`} className="flex items-start gap-2">
                                    <a href={`#ref-footnote-${index + 1}`} className="w-5 text-right font-bold text-blue-600 dark:text-blue-400 text-xs leading-snug pt-0.5 no-underline hover:underline">{index + 1}.</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
                
                {specialNotes.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg mb-2 font-headline text-red-600 dark:text-red-400">Special Notes</h3>
                        <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                            {specialNotes.map((note, index) => (
                                <li key={`sn-${index}`} id={`specialnote-${index + 1}`} className="flex items-start gap-2">
                                    <a href={`#ref-specialnote-${index + 1}`} className="w-5 text-right font-bold text-red-600 dark:text-red-400 text-xs leading-snug pt-0.5 no-underline hover:underline">[* {index + 1}]</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}

function RenderedBlock({ block, isGlossaryMode, glossary, bookmarks, articleInfo, activeGlossaryColor, highlightTarget }: {
    block: ContentBlock;
    isGlossaryMode: boolean;
    glossary: GlossaryTerm[];
    bookmarks: Set<string>;
    articleInfo: { book: BookContent; chapter: Chapter; article: Article };
    activeGlossaryColor?: string;
    highlightTarget: string | null;
}) {
    const [currentHtml, setCurrentHtml] = useState(block.sanskrit);
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const isBookmarked = bookmarks.has(`block-${block.id}`);
    const existingNote = useMemo(() => {
        const bookmark = Array.from(bookmarks).find(b => b === `block-note-${block.id}`);
        return bookmark ? "Your saved note..." : undefined;
    }, [bookmarks, block.id]);
    
    const glossaryTermsMap = useMemo(() => {
      const map = new Map<string, GlossaryTerm>();
      glossary.forEach(g => {
          const stemmedTerm = g.term.replace(/ः$/, '');
          if (!map.has(stemmedTerm)) {
              map.set(stemmedTerm, g);
          }
      });
      return map;
    }, [glossary]);

    const termsRegex = useMemo(() => {
        if (!isGlossaryMode || glossaryTermsMap.size === 0) return null;
        
        const stemmedTerms = Array.from(glossaryTermsMap.keys());
        stemmedTerms.sort((a,b) => b.length - a.length);

        const escapedTerms = stemmedTerms.map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        if (escapedTerms.length === 0) return null;

        const pattern = `(${escapedTerms.join('|')})`;
        try {
            return new RegExp(pattern, 'gu');
        } catch (e) {
            console.error("Error creating glossary regex:", e);
            return null;
        }
    }, [glossaryTermsMap, isGlossaryMode]);


    useEffect(() => {
        setCurrentHtml(block.sanskrit);
    }, [block.sanskrit]);

    const handleTranslate = (translatedHtml: string) => {
        setCurrentHtml(translatedHtml);
    };

    const handleReset = () => {
        setCurrentHtml(block.sanskrit);
    };
    
    const socialInteractionTools = [
        { id: 'layer', icon: Layers, label: 'Add Layer', action: () => setActiveDialog('layer') },
        { id: 'spark', icon: Lightbulb, label: 'Leave a Spark', action: () => setActiveDialog('spark') },
        { id: 'point', icon: Link2, label: 'Connect Point', action: () => setActiveDialog('point') },
        { id: 'drift', icon: GitBranch, label: 'Start a Drift', action: () => setActiveDialog('drift') },
    ];
    
    const isCommentary = ALL_COMMENTARY_TYPES.includes(block.type);
    const isSource = ALL_SOURCE_TYPES.includes(block.type);
    
    return (
        <div id={block.id} data-block-type={block.type} className={cn("py-2 group relative rounded-md -mx-2 px-2", highlightTarget === block.id && 'highlight-flash')}>
             <div className="absolute top-2 right-0 z-10 flex items-center gap-1 rounded-full border bg-background/70 p-1 shadow-md backdrop-blur-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 no-print">
                <BookmarkButton
                    isBookmarked={isBookmarked}
                    type="block"
                    book={articleInfo.book}
                    chapter={articleInfo.chapter}
                    article={articleInfo.article}
                    block={block}
                    size="icon"
                />
                 <GlowButton articleInfo={articleInfo} block={block} />
                <BlockTranslator sourceHtml={block.sanskrit} onTranslate={handleTranslate} onReset={handleReset} />
            </div>

            {isCommentary && block.commentary && (
                <div className="prose-styling font-bold text-xl mb-4 text-primary/80 font-headline">
                    <Transliterate>
                        {block.commentary.shortName}: {getSanskritLabelById(block.type)}
                    </Transliterate>
                     <span
                        className="inline-block h-0.5 w-[8%] bg-primary/80 align-middle ml-2 rounded-full"
                    />
                </div>
            )}
            
            {!isCommentary && isSource && (
                <div className="prose-styling font-bold text-xl mb-4 text-foreground/80 font-headline">
                   <Transliterate>{getIastLabelById(block.type)} ({getSanskritLabelById(block.type)})</Transliterate>
                     <span
                        className="inline-block h-0.5 w-[8%] bg-foreground/80 align-middle ml-2 rounded-full"
                    />
                </div>
            )}
            
            <div data-sanskrit-text="true" className="prose-styling">
                <HtmlContentParser
                    htmlString={currentHtml}
                    isGlossaryMode={isGlossaryMode}
                    glossary={glossary}
                    termsRegex={termsRegex}
                    glossaryTermsMap={glossaryTermsMap}
                    activeGlossaryColor={activeGlossaryColor}
                />
            </div>
            
            <div className="mt-4 pt-2 border-t no-print opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Interact
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1">
                        <div className="flex flex-col">
                            {socialInteractionTools.map(tool => (
                                <Button key={tool.id} variant="ghost" className="justify-start" onClick={tool.action}>
                                    <tool.icon className="mr-2 h-4 w-4" />
                                    {tool.label}
                                </Button>
                            ))}
                            <Button variant="ghost" onClick={() => setActiveDialog('note')} className="justify-start">
                                <StickyNote className="mr-2 h-4 w-4" />
                                <span>{existingNote ? 'Edit Note' : 'Add Note (private)'}</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
             </div>

            {/* Dialogs for this block */}
            <SparkDialog open={activeDialog === 'spark'} onOpenChange={() => setActiveDialog(null)} articleInfo={articleInfo} block={block} />
            <LayerDialog open={activeDialog === 'layer'} onOpenChange={() => setActiveDialog(null)} articleInfo={articleInfo} block={block} />
            <PointDialog open={activeDialog === 'point'} onOpenChange={() => setActiveDialog(null)} articleInfo={articleInfo} block={block} />
            <DriftDialog open={activeDialog === 'drift'} onOpenChange={() => setActiveDialog(null)} articleInfo={articleInfo} block={block} />
            <NoteDialog 
                open={activeDialog === 'note'} 
                onOpenChange={() => setActiveDialog(null)} 
                articleInfo={articleInfo} 
                block={block}
                existingNote={existingNote}
            />
        </div>
    );
}

export function PublicArticleRenderer({ 
    blocks, 
    isGlossaryMode = false, 
    glossary = [], 
    bookmarks,
    articleInfo,
    activeGlossaryColor,
    hideNotes = false,
    showTitle = true,
    highlightTarget
}: { 
    blocks: ContentBlock[], 
    isGlossaryMode?: boolean,
    glossary?: GlossaryTerm[],
    bookmarks: Bookmark[],
    articleInfo: { book: BookContent; chapter: Chapter; article: Article },
    activeGlossaryColor?: string,
    hideNotes?: boolean;
    showTitle?: boolean;
    highlightTarget?: string | null;
}) {
    const POETIC_TYPES = ['shloka', 'sutra', 'padya', 'richa', 'mantra', 'upanishad'];
    
    const bookmarkSet = useMemo(() => {
        const set = new Set<string>();
        bookmarks.forEach(b => {
            const identifier = b.type === 'article'
                ? `article-${b.bookId}-${b.chapterId}-${b.verse}`
                : `block-${b.blockId}`;
            set.add(identifier);
            if (b.note && b.blockId) {
                 set.add(`block-note-${b.blockId}`);
            }
        });
        return set;
    }, [bookmarks]);
    
    return (
        <Transliterate>
            <div className="prose-content note-context">
                 {showTitle && (
                    <header className="mb-8 text-center prose-styling">
                        <h1><Transliterate>{articleInfo.article.title}</Transliterate></h1>
                        <p className="text-xl text-muted-foreground mt-2">
                           Verse {articleInfo.article.verse}
                        </p>
                    </header>
                 )}
                <div className="article-reader-body">
                    {blocks.map((block, index) => {
                        if (!block.sanskrit) return null;
                        
                        const prevBlock = index > 0 ? blocks[index - 1] : null;
                        const isCommentary = ALL_COMMENTARY_TYPES.includes(block.type);
                        const useTightSpacing = prevBlock && POETIC_TYPES.includes(block.type) && POETIC_TYPES.includes(prevBlock.type!);

                        return (
                            <div key={block.id} className={useTightSpacing ? 'mt-2' : 'mt-6'}>
                                {index > 0 && !isCommentary && !useTightSpacing && <Separator className="my-6" />}
                                <RenderedBlock
                                    block={block}
                                    isGlossaryMode={isGlossaryMode}
                                    glossary={glossary}
                                    bookmarks={bookmarkSet}
                                    articleInfo={articleInfo}
                                    activeGlossaryColor={activeGlossaryColor}
                                    highlightTarget={highlightTarget || null}
                                />
                            </div>
                        );
                    })}
                </div>
                {!hideNotes && <ArticleNotes blocks={blocks} />}
            </div>
        </Transliterate>
    );
}
