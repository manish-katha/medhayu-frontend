
'use client';

import React, { useMemo } from 'react';
import parse, { domToReact, Element } from 'html-react-parser';
import type { ContentBlock } from '@/types/book';
import { useBookTheme } from './theme/BookThemeContext';
import { useTransliteration } from './transliteration-provider';
import { getIastLabelById, getSanskritLabelById } from '@/types/sanskrit.types';
import { Transliterate } from './transliteration-provider';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getCitationDetails } from '@/services/citation.service'; // Assuming service exists

interface ArticleRendererProps {
  blocks: ContentBlock[];
  isGlossaryOn?: boolean;
  articleInfo?: any;
  highlightTarget?: string | null;
  // Deprecated props, functionality is now internal to the renderer
  glossaryTerms?: any[];
  bookmarks?: any[];
}

// Placeholder for citation data fetching
const CitationHoverCard = ({ refId }: { refId: string }) => {
    const [details, setDetails] = React.useState<{ source: string, location: string } | null>(null);

    React.useEffect(() => {
        getCitationDetails(refId).then(setDetails);
    }, [refId]);

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <span 
                    className="bg-blue-100 text-blue-800 p-1 rounded-sm font-mono text-xs cursor-pointer hover:bg-blue-200"
                    data-citation-node={refId}
                >
                    [{refId}]
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                {details ? (
                    <div className="space-y-1">
                        <span className="font-semibold block">{details.source}</span>
                        <p className="text-sm">{details.location}</p>
                    </div>
                ) : (
                    <span>Loading citation...</span>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ blocks }) => {
    const { theme } = useBookTheme();
    const { transliterateText } = useTransliteration();

    const allNotes = useMemo(() => {
        const footnotes: string[] = [];
        const specialnotes: string[] = [];

        if (typeof window === 'undefined') return { footnotes, specialnotes };
        
        const parser = new DOMParser();
        const combinedHtml = blocks.map(b => b.sanskrit || '').join('');
        if (!combinedHtml) return { footnotes, specialnotes };

        const doc = parser.parseFromString(`<div>${combinedHtml}</div>`, 'text/html');

        doc.querySelectorAll('sup[data-type="footnote"]').forEach(el => {
            footnotes.push(el.getAttribute('data-content') || '');
        });
        doc.querySelectorAll('sup[data-type="specialnote"]').forEach(el => {
            specialnotes.push(el.getAttribute('data-content') || '');
        });

        return { footnotes, specialnotes };
    }, [blocks]);

    const hasCustomChild = (children: any[]): boolean => {
        if (!children) return false;
        return children.some(child => {
            if (child.type === 'tag') {
                if (child.name === 'div' && child.attribs['data-citation-node']) return true;
                if (child.name === 'span' && child.attribs['data-citation']) return true;
                 if (child.name === 'sup' && child.attribs['data-type']) return true;
                if (child.children) return hasCustomChild(child.children);
            }
            return false;
        });
    }

    const parseOptions = {
      replace: (domNode: any) => {
        if (domNode instanceof Element && domNode.attribs) {
           // If a p tag contains a custom interactive component, render it as a div to avoid nesting errors.
          if (domNode.name === 'p' && hasCustomChild(domNode.children)) {
            return <div>{domToReact(domNode.children, parseOptions)}</div>;
          }

          if (domNode.tagName === 'sup' && domNode.attribs['data-type'] === 'footnote') {
            const noteIndex = allNotes.footnotes.indexOf(domNode.attribs['data-content'] || '') + 1;
            return (
              <sup className="text-info font-bold select-none text-xs">
                <a href={`#footnote-${noteIndex}`} id={`ref-footnote-${noteIndex}`} className="no-underline hover:underline">[{noteIndex}]</a>
              </sup>
            );
          }
          if (domNode.tagName === 'sup' && domNode.attribs['data-type'] === 'specialnote') {
            const noteIndex = allNotes.specialnotes.indexOf(domNode.attribs['data-content'] || '') + 1;
            return (
              <sup className="text-destructive font-bold select-none text-xs">
                <a href={`#specialnote-${noteIndex}`} id={`ref-specialnote-${noteIndex}`} className="no-underline hover:underline">[* {noteIndex}]</a>
              </sup>
            );
          }
          if (domNode.attribs['data-citation-node']) {
            return <CitationHoverCard refId={domNode.attribs['data-citation-node']} />;
          }
          if (domNode.tagName === 'span' && domNode.attribs['data-citation'] === 'true') {
            const refId = domNode.attribs['data-ref-id'];
            if(refId) return <CitationHoverCard refId={refId} />;
          }
        }
      }
    };


    if (!blocks || blocks.length === 0) {
        return <p className="text-muted-foreground">This article has no content yet.</p>;
    }

    const themeStyles: React.CSSProperties = {
        '--book-primary-color': theme?.color.primary || 'inherit',
        '--book-secondary-color': theme?.color.secondary || 'inherit',
        '--book-accent-color': theme?.color.accent || 'inherit',
        '--book-background-color': theme?.color.background || 'inherit',
        '--book-text-color': theme?.color.text || 'inherit',
        '--font-body': theme?.font.body || 'sans-serif',
        '--font-headline': theme?.font.headline || 'serif',
    } as React.CSSProperties;

    return (
        <div className="prose-content" style={themeStyles}>
            <div className="article-reader-body">
                {blocks.map((block, index) => {
                    const isCommentary = block.commentary && block.commentary.author;
                    return (
                        <div key={block.id || index} className="mt-6">
                            {isCommentary ? (
                                <div className="font-bold text-xl mb-4 text-primary/80 font-headline" style={{ color: 'var(--book-primary-color)' }}>
                                    <Transliterate>{block.commentary!.shortName} :: {getSanskritLabelById(block.type)}</Transliterate>
                                    <span className="inline-block h-0.5 w-[8%] bg-primary/80 align-middle ml-2 rounded-full" style={{ backgroundColor: 'var(--book-primary-color)' }}/>
                                </div>
                            ) : (
                                <div className="font-bold text-xl mb-4 text-foreground/80 font-headline" style={{ color: 'var(--book-text-color)' }}>
                                    <span><Transliterate>{getIastLabelById(block.type)} ({getSanskritLabelById(block.type)})</Transliterate></span>
                                    <span className="inline-block h-0.5 w-[8%] bg-foreground/80 align-middle ml-2 rounded-full" style={{ backgroundColor: 'var(--book-text-color)' }} />
                                </div>
                            )}
                             {block.sanskrit && <div className="prose-styling">{parse(transliterateText(block.sanskrit), parseOptions)}</div>}
                        </div>
                    )
                })}
            </div>

             {(allNotes.footnotes.length > 0 || allNotes.specialnotes.length > 0) && (
                <div className="mt-12 pt-8 border-t footnotes-container font-devanagari">
                    {allNotes.footnotes.length > 0 && (
                        <div className="space-y-2 md:border-r md:pr-8">
                            <h3 className="font-bold text-lg mb-2 font-headline" style={{ color: 'var(--book-primary-color)' }}>Footnotes</h3>
                            <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                                {allNotes.footnotes.map((note, index) => (
                                <li key={`fn-${index}`} id={`footnote-${index + 1}`} className="flex items-start gap-2">
                                    <a href={`#ref-footnote-${index + 1}`} className="w-5 text-right font-bold text-blue-600 dark:text-blue-400 text-xs leading-snug pt-0.5 no-underline hover:underline">{index + 1}.</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                                ))}
                            </ol>
                        </div>
                    )}
                     {allNotes.specialnotes.length > 0 && (
                         <div className="space-y-2">
                             <h3 className="font-bold text-lg mb-2 font-headline text-red-600 dark:text-red-400">Special Notes</h3>
                             <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                                {allNotes.specialnotes.map((note, index) => (
                                <li key={`sn-${index}`} id={`specialnote-${index + 1}`} className="flex items-start gap-2">
                                    <a href={`#ref-specialnote-${index + 1}`} className="w-5 text-right font-bold text-red-600 dark:text-red-400 text-xs leading-snug pt-0.5 no-underline hover:underline">[* {index + 1}]</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                                ))}
                             </ol>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};
