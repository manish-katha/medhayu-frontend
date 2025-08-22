
'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, SuperscriptIcon, SubscriptIcon, Highlighter, Palette,
  List, ListOrdered, Indent, Outdent,
  Link as LinkIcon, Unlink, FileSymlink, ImageIcon, Table2, Minus, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

import { LinkDialog, ArticleLinkDialog, ImageDialog } from './dialogs';
import { ScholarlyToolbar } from './scholarly-toolbar';
import type { ContentBlock, BookStructure } from '@/types';

type ToolbarProps = {
  editor: Editor | null;
  block?: Partial<ContentBlock>;
  structure?: BookStructure;
  onBlockUpdate?: (id: string, updates: Partial<Omit<ContentBlock, 'id'>>) => void;
};

export function EditorToolbar({ editor, ...scholarlyProps }: ToolbarProps) {
  const [isArticleLinkDialogOpen, setIsArticleLinkDialogOpen] = React.useState(false);
  const [isExternalLinkDialogOpen, setIsExternalLinkDialogOpen] = React.useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  
  const openExternalLinkDialog = React.useCallback(() => {
    if (!editor) return;
    setIsExternalLinkDialogOpen(true);
  }, [editor]);
  
  const openImageDialog = React.useCallback(() => {
    if (!editor) return;
    setIsImageDialogOpen(true);
  }, [editor]);

  const setExternalLink = React.useCallback((url: string) => {
    if (url === null) { 
      return;
    }
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  
  const handleSelectInternalLink = React.useCallback((url: string) => {
    if (editor) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const getBlockTypeLabel = () => {
    if (editor.isActive('paragraph')) return 'Paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    return 'Style';
  };
  
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-background p-1" onMouseDown={(e) => e.preventDefault()}>
      <LinkDialog 
        isOpen={isExternalLinkDialogOpen}
        onOpenChange={setIsExternalLinkDialogOpen}
        initialUrl={editor.getAttributes('link').href}
        onSave={setExternalLink}
      />
      <ArticleLinkDialog 
        isOpen={isArticleLinkDialogOpen}
        onOpenChange={setIsArticleLinkDialogOpen}
        onSelectLink={handleSelectInternalLink}
      />
       <ImageDialog 
        editor={editor}
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-[120px] justify-between h-9 px-2.5">
            <span className="truncate">{getBlockTypeLabel()}</span>
            <ChevronDown className="h-4 w-4" />
        </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem 
            onClick={() => editor.chain().focus().setParagraph().run()}
            disabled={!editor.can().setParagraph()}
            >
            Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={!editor.can().toggleHeading({ level: 1 })}
            >
            Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={!editor.can().toggleHeading({ level: 2 })}
            >
            Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={!editor.can().toggleHeading({ level: 3 })}
            >
            Heading 3
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8 mx-1" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
        className="h-9 w-9"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
        className="h-9 w-9"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
        className="h-9 w-9"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      
       <div className="relative inline-flex items-center justify-center">
         <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => (document.getElementById('color-picker') as any)?.click()}
            title="Text Color"
        >
            <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
        </Button>
        <input
            type="color"
            className="absolute h-0 w-0 opacity-0"
            id="color-picker"
            onInput={(event) => editor.chain().focus().setColor((event.target as any).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
        />
      </div>

       <Separator orientation="vertical" className="h-8 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
        className="h-9 w-9"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('superscript')}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
        disabled={!editor.can().chain().focus().toggleSuperscript().run()}
        title="Superscript"
        className="h-9 w-9"
      >
        <SuperscriptIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('subscript')}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
        disabled={!editor.can().chain().focus().toggleSubscript().run()}
        title="Subscript"
        className="h-9 w-9"
      >
        <SubscriptIcon className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive('highlight')}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        title="Highlight"
        className="h-9 w-9"
      >
        <Highlighter className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8 mx-1" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" aria-label="Insert Link" title="Insert Link">
                <LinkIcon className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onSelect={openExternalLinkDialog}>
                <LinkIcon className="mr-2 h-4 w-4" /> External URL
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
                <Unlink className="mr-2 h-4 w-4" /> Remove Link
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-2.5">Insert</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={openImageDialog}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <Table2 className="mr-2 h-4 w-4" />
            Table
          </DropdownMenuItem>
           <DropdownMenuItem onSelect={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="mr-2 h-4 w-4" />
            Horizontal Rule
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-8 mx-1" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align Left"
        className="h-9 w-9"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align Center"
        className="h-9 w-9"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align Right"
        className="h-9 w-9"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'justify' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
        title="Align Justify"
        className="h-9 w-9"
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8 mx-1" />

       <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        title="Bullet List"
        className="h-9 w-9"
      >
        <List className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        title="Ordered List"
        className="h-9 w-9"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor?.can().sinkListItem('listItem')}
        title="Indent"
      >
        <Indent className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!editor?.can().liftListItem('listItem')}
        title="Outdent"
      >
        <Outdent className="h-4 w-4" />
      </Button>
    </div>
  );
}
