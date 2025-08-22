
'use client';

import React from 'react';
import type { BookTheme, StyleProperty } from '@/types';

function generateCssRules(styles: BookTheme['styles'], scopeSelector: string, dynamicFontSize?: number): string {
    let css = ``;

    const applyStyles = (selector: string, style: StyleProperty | undefined) => {
        if (!style) return '';

        // Target the prose-styling class within the scoped selector
        let rule = `${scopeSelector} .prose-styling ${selector} {`;
        let hasProps = false;
        for (let [prop, value] of Object.entries(style)) {
            if (value) {
                const isParagraphFontSize = selector.includes('p') && prop === 'fontSize';
                
                if (isParagraphFontSize && dynamicFontSize) {
                    value = `${dynamicFontSize}px`;
                }

                 if (prop === 'color' && typeof value === 'string' && value.includes('gradient')) {
                    rule += `background: ${value} !important;`;
                    rule += `-webkit-background-clip: text !important; background-clip: text !important; color: transparent !important;`;
                } else if (prop === 'backgroundColor' && typeof value === 'string' && value.includes('gradient')) {
                    rule += `background-image: ${value} !important;`;
                }
                else {
                    const cssPropName = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                    rule += `${cssPropName}: ${value} !important;`;
                }
                hasProps = true;
            }
        }
        rule += `}\n`;
        return hasProps ? rule : '';
    };
    
    // Apply styles to base prose elements first to remove defaults
    css += `
      ${scopeSelector} .prose-styling h1,
      ${scopeSelector} .prose-styling h2,
      ${scopeSelector} .prose-styling h3,
      ${scopeSelector} .prose-styling h4,
      ${scopeSelector} .prose-styling h5,
      ${scopeSelector} .prose-styling h6,
      ${scopeSelector} .prose-styling p {
        color: inherit;
        font-family: inherit;
        margin-top: 1.25em;
        margin-bottom: 1.25em;
      }
    `;

    css += applyStyles('h1', styles.h1);
    css += applyStyles('h2', styles.h2);
    css += applyStyles('h3', styles.h3);
    css += applyStyles('h4', styles.h4);
    css += applyStyles('h5', styles.h5);
    css += applyStyles('h6', styles.h6);
    css += applyStyles('p', styles.paragraph);
    css += applyStyles('[data-block-type="sutra"] p', styles.sutra);
    css += applyStyles('[data-block-type="bhashya"] p', styles.bhashya);
    css += applyStyles('[data-block-type="teeka"] p', styles.teeka);
    css += applyStyles('[data-citation-node]', styles.citation);
    css += applyStyles('blockquote', styles.quotation);
    css += applyStyles('.version-word', styles.version);
    
    // Specific selectors for notes and TOC
    css += applyStyles('.footnotes-list li', styles.footnote);
    css += applyStyles('[id^="specialnote-"]', styles.specialNote);
    css += applyStyles('[data-toc-container] h4', styles.toc);
    css += applyStyles('[data-toc-container] button', styles.toc);
    
    return css;
}


export function ThemeApplier({ theme, scopeToId, dynamicFontSize }: { theme: BookTheme, scopeToId?: string, dynamicFontSize?: number }) {
    const css = React.useMemo(() => {
        const scope = scopeToId ? `#${scopeToId}` : 'body';
        return generateCssRules(theme.styles, scope, dynamicFontSize);
    }, [theme, scopeToId, dynamicFontSize]);

    return (
        <style dangerouslySetInnerHTML={{ __html: css }} />
    );
}
