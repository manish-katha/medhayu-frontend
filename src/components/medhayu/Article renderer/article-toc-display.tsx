
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { ContentBlock } from '@/types';
import { getSanskritLabelById, getIastLabelById, ALL_COMMENTARY_TYPES, ALL_SOURCE_TYPES } from '@/types/sanskrit.types';
import { Transliterate } from '@/components/transliteration-provider';

interface TocItem {
  id: string;
  text: React.ReactNode;
  level: number;
}

export function ArticleTocDisplay({ blocks, onHighlight }: {
  blocks?: Partial<ContentBlock>[];
  onHighlight?: (id: string) => void;
}) {
  const tocItems = React.useMemo(() => {
    if (!blocks) return [];
    
    return blocks.map(block => {
      if (!block || !block.id || !block.type) return null;
      
      const isCommentary = ALL_COMMENTARY_TYPES.includes(block.type);
      const isSource = ALL_SOURCE_TYPES.includes(block.type);
      let textNode: React.ReactNode = null;
      let level = 1;

      if (isCommentary) {
        level = 2;
        textNode = (
          <Transliterate>
            {block.commentary ? 
              `${block.commentary.shortName} - ${getSanskritLabelById(block.type)}` :
              `Commentary: ${getSanskritLabelById(block.type)}`}
          </Transliterate>
        );
      } else if (isSource) {
        level = 1;
        textNode = (
          <Transliterate>
            {getIastLabelById(block.type)} ({getSanskritLabelById(block.type)})
          </Transliterate>
        );
      } else {
          return null; // Don't show blocks that are not source or commentary
      }

      return { id: block.id, text: textNode, level };
    }).filter(Boolean) as TocItem[];
  }, [blocks]);


  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    onHighlight?.(id);
  };

  if (tocItems.length === 0) {
    return (
      <div className="p-4 text-sm text-center text-muted-foreground">
        No content blocks to display in the outline.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-lg px-2">Article Outline</h4>
      <ul className="space-y-1">
        {tocItems.map(item => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 0.5}rem` }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleLinkClick(e, item.id)}
              className="text-left justify-start h-auto py-1 text-muted-foreground hover:text-primary w-full text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {item.text}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

