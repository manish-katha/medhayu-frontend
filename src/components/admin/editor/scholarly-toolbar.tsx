
'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { MessageSquare, Footprints, Book, Quote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface ScholarlyToolbarProps {
  editor: Editor | null;
  onNoteButtonClick: (type: 'footnote' | 'specialnote') => void;
  onCitationClick: () => void;
  onQuoteClick: () => void;
}

// This component is now deprecated in favor of ScholarlyBubbleMenu
export function ScholarlyToolbar({ 
    editor, 
    onNoteButtonClick,
    onCitationClick,
    onQuoteClick,
}: ScholarlyToolbarProps) {
  if (!editor) return null;

  return null; // Return null to hide the static toolbar
}
