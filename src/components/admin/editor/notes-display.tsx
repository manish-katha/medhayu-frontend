
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ContentBlock } from '@/types/book';
import { getCitationDetails } from '@/services/citation.service'; // Assuming service exists
import { cn } from '@/lib/utils';
import { Transliterate } from '@/components/transliteration-provider';


function CitationListItem({ refId }: { refId: string }) {
    const [details, setDetails] = useState<{ source: string, location: string } | null>(null);

    useEffect(() => {
        getCitationDetails(refId).then(setDetails);
    }, [refId]);

    return (
        <li className="text-sm">
            <strong>{refId}:</strong> {details ? `${details.source}, ${details.location}` : 'Loading...'}
        </li>
    )
}


export function EditorNotesDisplay({ blocks, highlightTarget, onHighlight }: { 
    blocks: Partial<ContentBlock>[],
    highlightTarget?: string | null,
    onHighlight?: (id: string) => void,
}) {
    const notes = useMemo(() => {
        const footnotes: string[] = [];
        const specialnotes: string[] = [];
        const citations = new Set<string>();
        
        if (typeof window === 'undefined') {
            return { footnotes, specialnotes, citations: Array.from(citations) };
        }

        const parser = new DOMParser();
        const combinedHtml = blocks.map(b => b?.sanskrit || '').join('');
        if (!combinedHtml) {
            return { footnotes: [], specialnotes: [], citations: [] };
        }

        const doc = parser.parseFromString(`<div>${combinedHtml}</div>`, 'text/html');

        doc.querySelectorAll('sup[data-type="footnote"]').forEach(el => {
            const content = el.getAttribute('data-content');
            if (content) footnotes.push(content);
        });
        doc.querySelectorAll('sup[data-type="specialnote"]').forEach(el => {
            const content = el.getAttribute('data-content');
            if (content) specialnotes.push(content);
        });
        doc.querySelectorAll('span[data-citation="true"]').forEach(el => {
            const refId = el.getAttribute('data-ref-id');
            if (refId) citations.add(refId);
        });

        return {
            footnotes,
            specialnotes,
            citations: Array.from(citations).sort(),
        };
    }, [blocks]);

    const { footnotes, specialnotes, citations } = notes;
    const hasFootnotes = footnotes.length > 0;
    const hasSpecialNotes = specialnotes.length > 0;
    const hasCitations = citations.length > 0;

    if (!hasFootnotes && !hasSpecialNotes && !hasCitations) return null;

    return (
        <div className="mt-8 pt-6 border-t bg-background p-4 sm:p-6 rounded-b-lg space-y-6">
            <div className="footnotes-container grid grid-cols-1 md:grid-cols-2 gap-8">
                {hasFootnotes && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Footnotes</h4>
                        <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                            {footnotes.map((note, index) => (
                                <li key={`fn-${index}`} id={`footnote-${index + 1}`} className={cn("flex items-start gap-2 transition-colors duration-500 p-1 rounded-md", highlightTarget === `ref-footnote-${index+1}` && 'bg-yellow-100')}>
                                    <a href={`#ref-footnote-${index + 1}`} className="w-5 text-right font-bold text-blue-600 dark:text-blue-400 text-xs leading-snug pt-0.5 no-underline hover:underline" onClick={(e) => { e.preventDefault(); onHighlight?.(`ref-footnote-${index+1}`)}}>{index + 1}.</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {hasSpecialNotes && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-red-600 dark:text-red-400">Special Notes</h4>
                        <ol className="footnotes-list space-y-2 text-sm text-muted-foreground prose-styling max-w-none">
                            {specialnotes.map((note, index) => (
                                <li key={`sn-${index}`} id={`specialnote-${index + 1}`} className={cn("flex items-start gap-2 transition-colors duration-500 p-1 rounded-md", highlightTarget === `ref-specialnote-${index+1}` && 'bg-yellow-100')}>
                                    <a href={`#ref-specialnote-${index + 1}`} className="w-5 text-right font-bold text-red-600 dark:text-red-400 text-xs leading-snug pt-0.5 no-underline hover:underline" onClick={(e) => { e.preventDefault(); onHighlight?.(`ref-specialnote-${index+1}`)}}>*</a>
                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: note }} />
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>

            {hasCitations && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-lg text-purple-600 dark:text-purple-400">Citations in this Article</h4>
                    <ul className="list-none mt-2 space-y-1">
                        {citations.map(refId => <CitationListItem key={refId} refId={refId} />)}
                    </ul>
                </div>
            )}
        </div>
    );
}
