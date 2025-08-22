
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ContentBlock, Citation as CitationType, GlossaryTerm } from '@/types/book';
import { getCitationByRefId } from '@/services/citation.service';
import { Transliterate, useTransliteration } from './transliteration-provider';
import { ALL_COMMENTARY_TYPES, getTypeLabelById, getIastLabelById, getSanskritLabelById, ALL_SOURCE_TYPES } from '@/types';
import { PublicCitationTooltip, PublicNoteTooltip, VersionWordTooltip, GlossaryTermTooltip } from './tooltips';
import { useBookTheme } from './theme-provider';

// This is the core renderer, it does not fetch data, only displays it.
function HtmlContent({ htmlString, isGlossaryMode, glossaryTermsMap, activeGlossaryColor }: {
    htmlString: string;
    isGlossaryMode: boolean;
    glossaryTermsMap: Map<string, GlossaryTerm>;
    activeGlossaryColor?: string;
}) {
    // This component will be implemented later to handle parsing and displaying
    // the rich text content, including glossary terms and citations.
    // For now, it will just render the raw HTML.
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

function RenderedBlock({ block, ...props }: {
    block: ContentBlock;
    isGlossaryMode: boolean;
    glossaryTermsMap: Map<string, GlossaryTerm>;
    activeGlossaryColor?: string;
}) {
    const isCommentary = ALL_COMMENTARY_TYPES.includes(block.type);
    const isSource = ALL_SOURCE_TYPES.includes(block.type);

    return (
        <div data-block-id={block.id} className="prose-content-block">
             {isCommentary && block.commentary && (
                <h3 className="font-semibold text-xl mb-4 font-headline text-primary/80" style={{ color: 'var(--book-primary-color)' }}>
                    <Transliterate>{block.commentary.shortName}: {getSanskritLabelById(block.type)}</Transliterate>
                    <span className="inline-block h-0.5 w-[8%] bg-primary/80 align-middle ml-2 rounded-full" style={{ backgroundColor: 'var(--book-primary-color)' }}/>
                </h3>
            )}
            
            {!isCommentary && isSource && (
                <h3 className="font-bold text-xl mb-4 text-foreground/80 font-headline" style={{ color: 'var(--book-text-color)' }}>
                   <Transliterate>{getIastLabelById(block.type)} ({getSanskritLabelById(block.type)})</Transliterate>
                     <span className="inline-block h-0.5 w-[8%] bg-foreground/80 align-middle ml-2 rounded-full" style={{ backgroundColor: 'var(--book-text-color)' }} />
                </h3>
            )}
             <HtmlContent 
                htmlString={block.sanskrit}
                isGlossaryMode={props.isGlossaryMode}
                glossaryTermsMap={props.glossaryTermsMap}
                activeGlossaryColor={props.activeGlossaryColor}
             />
        </div>
    )
}

export function ArticleRenderer({ blocks }: { blocks: ContentBlock[] }) {
    const { theme } = useBookTheme();
    const POETIC_TYPES = ['shloka', 'sutra', 'padya', 'richa', 'mantra', 'upanishad'];

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
        <div style={themeStyles} className="prose-styling">
            {blocks.map((block, index) => {
                 const prevBlock = index > 0 ? blocks[index - 1] : null;
                 const useTightSpacing = prevBlock && POETIC_TYPES.includes(block!.type!) && POETIC_TYPES.includes(prevBlock!.type!);
                 return (
                    <div key={block.id} className={useTightSpacing ? "mt-2" : "mt-6"}>
                         <RenderedBlock 
                             block={block}
                             isGlossaryMode={false}
                             glossaryTermsMap={new Map()}
                         />
                    </div>
                 )
            })}
        </div>
    );
}

