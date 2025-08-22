
'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor, type Range } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Link as LinkExtension } from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import type { Citation, Quote, QuoteCategory, GlossaryCategory } from '@/types';
import { getQuoteData } from '@/services/quote.service';
import Placeholder from '@tiptap/extension-placeholder';
import { addCommentToArticle } from '@/app/articles/actions';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';

import {
  CustomImage,
  NoteNode,
  CitationNode,
  TocMark,
  headingIdPlugin,
  FontSize,
  CitationSuggestion,
  QuoteSuggestions,
  ParagraphClassExtension,
  GlossaryHighlighterExtension,
  VersionWordMark,
  ScholarlyQuoteNode,
} from './editor/tiptap-extensions';
import { TableBubbleMenu, ImageBubbleMenu, NoteBubbleMenu, ScholarlyBubbleMenu } from './editor/bubble-menus';
import { NoteDialog } from './editor/note-dialog';
import { CreateQuoteDialog } from './quote-forms';


type RichTextEditorProps = {
  id: string;
  content: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  setEditorInstance?: (id: string, editor: Editor) => void;
  removeEditorInstance?: (id: string) => void;
  activeGlossary?: GlossaryCategory | null;
  placeholder?: string;
  onAddComment?: (text: string) => void;
  onNewQuoteFound?: (text: string, range: Range) => void;
};

export function RichTextEditor({
  id,
  content,
  onChange,
  onFocus,
  setEditorInstance,
  removeEditorInstance,
  activeGlossary = null,
  placeholder,
  onAddComment,
  onNewQuoteFound,
}: RichTextEditorProps) {
  const [noteState, setNoteState] = React.useState<{ isOpen: boolean; type: string, position?: number }>({ isOpen: false, type: '' });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          heading: false,
          codeBlock: false, 
          code: false,
          horizontalRule: false,
          blockquote: false, // Using custom blockquote
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      ScholarlyQuoteNode,
      Blockquote,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }).extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                id: {
                    default: null,
                    parseHTML: element => element.getAttribute('id'),
                    renderHTML: attributes => ({ id: attributes.id }),
                },
            };
        },
      }),
      ParagraphClassExtension,
      HorizontalRule,
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      Color,
      FontSize,
      CustomImage.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      LinkExtension.configure({
        openOnClick: false,
        autolink: false,
        validate: href => /^https?:\/\//.test(href) || /^\/articles\//.test(href),
        inclusive: true,
      }),
      NoteNode,
      CitationSuggestion,
      QuoteSuggestions,
      TocMark,
      VersionWordMark,
      headingIdPlugin(),
      GlossaryHighlighterExtension.configure({
        terms: activeGlossary ? activeGlossary.terms : [],
        colorTheme: activeGlossary?.colorTheme,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      onFocus?.();
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none p-4',
        },
    },
  });

  // Sync content from props. Crucially, only do this if the editor is NOT focused
  // to avoid overwriting user input.
  React.useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);
  
  // This effect updates the glossary terms when the activeGlossary prop changes.
  React.useEffect(() => {
    if (editor) {
      editor.setOptions({
        extensions: editor.options.extensions.map(ext => {
            if (ext.name === 'glossaryHighlighter') {
                return ext.configure({
                    terms: activeGlossary ? activeGlossary.terms : [],
                    colorTheme: activeGlossary?.colorTheme,
                })
            }
            return ext;
        })
      });
    }
  }, [activeGlossary, editor]);

  React.useEffect(() => {
    if (editor) {
      setEditorInstance?.(id, editor);
    }
    return () => {
      removeEditorInstance?.(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editor, setEditorInstance, removeEditorInstance]);

  const handleNoteButtonClick = React.useCallback((type: 'footnote' | 'specialnote') => {
    if (!editor) return;
    const { from } = editor.state.selection;
    setNoteState({ isOpen: true, type, position: from });
  }, [editor]);

  const handleSaveNote = React.useCallback((noteContent: string) => {
    if (!noteContent || !editor || noteState.position === undefined) return;
    editor.chain().focus().insertContentAt(noteState.position, {
        type: 'note',
        attrs: {
            dataType: noteState.type,
            dataContent: noteContent
        }
    }).run();
    setNoteState({ isOpen: false, type: '' });
  }, [editor, noteState.type, noteState.position]);

  const handleCitationClick = React.useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent('[[').run();
  }, [editor]);

  const handleQuoteClick = React.useCallback(() => {
    if (!editor || !onNewQuoteFound) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (text) {
        onNewQuoteFound(text, { from, to });
    }
  }, [editor, onNewQuoteFound]);


  if (!editor) {
    return (
      <div className="prose-styling min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 animate-pulse" />
    );
  }

  return (
    <div className="bg-transparent">
        <NoteDialog
            isOpen={noteState.isOpen}
            onOpenChange={(isOpen) => setNoteState(prev => ({ ...prev, isOpen }))}
            noteType={noteState.type}
            onSave={handleSaveNote}
        />
        <TableBubbleMenu editor={editor} />
        <ImageBubbleMenu editor={editor} />
        <NoteBubbleMenu editor={editor} />
        <ScholarlyBubbleMenu
          editor={editor}
          onNoteButtonClick={handleNoteButtonClick}
          onQuoteClick={handleQuoteClick}
          onCitationClick={handleCitationClick}
          onAddComment={onAddComment}
        />
      <EditorContent editor={editor} />
    </div>
  );
};

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;
