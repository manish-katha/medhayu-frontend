
'use client';

import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Quote, MessageSquare, StickyNote, NotebookText, Swords, Rss } from 'lucide-react';

export function TextSelectionMenu({
  children,
  onSelectText,
  onSaveCitation,
  onAddComment,
  onAddNote,
  onCreateQuote,
  onRequestManthana,
  onPostToWall,
}: {
  children: ReactNode;
  onSelectText: (text: string) => void;
  onSaveCitation?: () => void;
  onAddComment?: () => void;
  onAddNote?: () => void;
  onCreateQuote?: () => void;
  onRequestManthana?: () => void;
  onPostToWall?: (text: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // The virtualRef is an object with a getBoundingClientRect method.
  // We update this method to return the DOMRect of the current text selection.
  const virtualRef = useRef({
    getBoundingClientRect: () => new DOMRect(),
  });

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (isOpen) setIsOpen(false);
      return;
    }

    const selectedText = selection.toString().trim();
    
    // Ensure the selection is within our component's content
    if (selectedText && containerRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      // Update the virtual reference with the selection's position
      virtualRef.current.getBoundingClientRect = () => range.getBoundingClientRect();
      setIsOpen(true);
      onSelectText(selectedText);
    } else {
      if (isOpen) setIsOpen(false);
    }
  }, [onSelectText, isOpen]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);
  
  // Close popover if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !event.target?.closest('[data-radix-popper-content-wrapper]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePostToWallClick = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    if (onPostToWall && text) {
      onPostToWall(text);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* The PopoverAnchor uses the virtualRef to position the PopoverContent */}
      <PopoverAnchor virtualRef={virtualRef} />
      {/* The content that can be selected is wrapped in the containerRef */}
      <div ref={containerRef}>
        {children}
      </div>
      <PopoverContent 
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
        className="w-auto p-1 flex items-center gap-1"
      >
        {onAddNote && (
          <Button variant="ghost" size="sm" onClick={onAddNote}>
            <StickyNote className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        )}
        {onSaveCitation && (
            <Button variant="ghost" size="sm" onClick={onSaveCitation}>
              <NotebookText className="mr-2 h-4 w-4" />
              Save Citation
            </Button>
        )}
        {onCreateQuote && (
            <Button variant="ghost" size="sm" onClick={onCreateQuote}>
              <Quote className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
        )}
        {onAddComment && (
            <Button variant="ghost" size="sm" onClick={onAddComment}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
        )}
        {onRequestManthana && (
            <Button variant="ghost" size="sm" onClick={onRequestManthana}>
              <Swords className="mr-2 h-4 w-4" />
              Request Manthana
            </Button>
        )}
        {onPostToWall && (
            <Button variant="ghost" size="sm" onClick={handlePostToWallClick}>
              <Rss className="mr-2 h-4 w-4" />
              Post to Wall
            </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
