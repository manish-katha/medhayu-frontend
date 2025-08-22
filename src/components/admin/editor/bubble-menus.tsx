
'use client';

import * as React from 'react';
import { Editor, BubbleMenu } from '@tiptap/react';
import {
  Trash2,
  Image,
  GripVertical,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowDownToLine,
  ArrowUpToLine,
  AlignCenter,
  AlignLeft,
  AlignRight,
  MessageSquare,
  Footprints,
  Book,
  Quote,
  BookMarked,
  ListTree
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const bubbleMenuClass = "flex items-center gap-1 bg-background border rounded-lg p-1 shadow-md";

// --- Scholarly Bubble Menu ---
export function ScholarlyBubbleMenu({
  editor,
  onNoteButtonClick,
  onQuoteClick,
  onCitationClick,
  onAddComment
}: {
  editor: Editor,
  onNoteButtonClick: (type: 'footnote' | 'specialnote') => void,
  onQuoteClick: () => void,
  onCitationClick: () => void,
  onAddComment?: (text: string) => void,
}) {
    if (!editor) return null;

    const isTocActive = editor.isActive('tocMark');

    const shouldShow = ({ editor }: { editor: Editor }) => {
        // Show if editor is focused, but not if it's an image or table
        return editor.isFocused && !editor.isActive('image') && !editor.isActive('table');
    }
    
    const handleCommentClick = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (onAddComment) {
        onAddComment(text);
      }
    };


    return (
      <BubbleMenu
        editor={editor}
        tippyOptions={{ 
            duration: 100,
            followCursor: 'horizontal',
            placement: 'bottom',
        }}
        shouldShow={shouldShow}
      >
        <div className={bubbleMenuClass}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onNoteButtonClick('footnote')}
                title="Add Footnote"
            >
                <Footprints className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onNoteButtonClick('specialnote')}
                title="Add Special Note"
            >
                <Book className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onQuoteClick}
                title="Create Quote from Selection"
            >
                <Quote className="h-4 w-4" />
            </Button>
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onCitationClick}
                 title="Create Citation"
            >
                <BookMarked className="h-4 w-4" />
            </Button>
             <Toggle
                size="sm"
                pressed={isTocActive}
                onPressedChange={() => editor.chain().focus().toggleTocMark().run()}
                title="Toggle TOC Mark"
                className="h-9 w-9"
            >
                <ListTree className="h-4 w-4" />
            </Toggle>
            {onAddComment && (
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleCommentClick}
                title="Add Comment"
            >
                <MessageSquare className="h-4 w-4" />
            </Button>
            )}
        </div>
      </BubbleMenu>
    );
}

// --- Table Bubble Menu ---
export function TableBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} shouldShow={({ editor }) => editor.isActive('table')}>
        <div className={bubbleMenuClass}>
            <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                <ArrowLeftToLine className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <ArrowRightToLine className="h-4 w-4" />
            </Button>
             <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowBefore().run()}>
                <ArrowUpToLine className="h-4 w-4" />
            </Button>
             <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().addRowAfter().run()}>
                <ArrowDownToLine className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().deleteTable().run()} className="text-destructive">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    </BubbleMenu>
  );
}

// --- Image Bubble Menu ---
export function ImageBubbleMenu({ editor }: { editor: Editor }) {
    return (
        <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        shouldShow={({ editor }) => editor.isActive('image')}
        >
        <div className={bubbleMenuClass}>
            <Toggle
                size="sm"
                pressed={editor.isActive({ float: 'left' })}
                onPressedChange={() => editor.chain().focus().setImageAttributes({ float: 'left' }).run()}
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ display: 'inline-block' })}
                onPressedChange={() => editor.chain().focus().setImageAttributes({ float: null, display: 'inline-block' }).run()}
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
             <Toggle
                size="sm"
                pressed={editor.isActive({ float: 'right' })}
                onPressedChange={() => editor.chain().focus().setImageAttributes({ float: 'right' }).run()}
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>
        </div>
        </BubbleMenu>
    );
}

// --- Note Bubble Menu ---
export function NoteBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'bottom' }} shouldShow={({ editor }) => editor.isActive('note')}>
        <div className={bubbleMenuClass}>
            <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().unsetNote().run()} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Remove Note
            </Button>
        </div>
    </BubbleMenu>
  );
}
