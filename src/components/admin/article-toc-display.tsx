
'use client';

import React from 'react';
import type { ContentBlock } from '@/types';
import { Button } from '../ui/button';

interface TocItem {
  id: string;
  text: React.ReactNode;
  level: number;
  isMark?: boolean;
  markIndex?: number;
}

export function ArticleTocDisplay({
  blocks,
  onHighlight,
}: {
  blocks?: Partial<ContentBlock>[];
  onHighlight?: (id: string, isMark?: boolean, markIndex?: number) => void;
}) {
  const tocItems = React.useMemo(() => {
    if (!blocks || typeof window === 'undefined') return [];
    
    const parser = new DOMParser();
    const allItems: TocItem[] = [];
    
    blocks.forEach(block => {
        if (!block || !block.id) return;
        
        const doc = parser.parseFromString(`<div>${block.sanskrit || ''}</div>`, 'text/html');
        let markCounter = 0;

        doc.querySelectorAll('h1, h2, h3, h4, h5, h6, span[data-toc-mark]').forEach(node => {
            const element = node as HTMLElement;
            const elementId = element.getAttribute('id') || `mark-${block.id}-${markCounter}`;

            if (element.tagName.startsWith('H')) {
                 allItems.push({
                    id: elementId,
                    level: parseInt(element.tagName.substring(1), 10),
                    text: element.textContent || '',
                    isMark: false,
                });
            } else if (element.hasAttribute('data-toc-mark')) {
                element.setAttribute('data-mark-id', elementId);
                 allItems.push({
                    id: elementId,
                    level: 7, // Custom level for indentation
                    text: element.textContent || '',
                    isMark: true,
                    markIndex: markCounter++,
                });
            }
        });
    });

    return allItems;
  }, [blocks]);


  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>, item: TocItem) => {
    e.preventDefault();
    if(onHighlight) {
        const elementIdToFind = item.isMark ? `mark-${item.id.split('-')[1]}-${item.markIndex}` : item.id;
        const mainEditorBlock = document.querySelector(`.article-editor-block[id='${item.id.split('-')[1]}']`);

        if (mainEditorBlock) {
             const target = item.isMark
                ? mainEditorBlock.querySelectorAll('span[data-toc-mark]')[item.markIndex || 0]
                : mainEditorBlock.querySelector(`h${item.level}`);
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 onHighlight(item.id.split('-')[1]);
            }
        }
    }
  };

  if (tocItems.length === 0) {
    return (
      <div className="p-4 text-sm text-center text-muted-foreground">
        No headings or marked entries found.
      </div>
    );
  }

  return (
    <div className="space-y-2" data-toc-container>
      <h4 className="font-semibold text-lg px-2">Article Outline</h4>
      <ul className="space-y-1">
        {tocItems.map((item, index) => (
          <li key={`${item.id}-${index}`} style={{ paddingLeft: `${(item.isMark ? item.level - 6 : item.level - 1) * 1}rem` }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleLinkClick(e, item)}
              className="text-left justify-start h-auto py-1 text-muted-foreground hover:text-primary w-full text-ellipsis overflow-hidden whitespace-nowrap"
              title={typeof item.text === 'string' ? item.text : ''}
            >
              {item.text}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
