
'use client';

import { Node, mergeAttributes, Mark, Extension } from '@tiptap/core';
import { ReactRenderer, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';
import type { Range } from '@tiptap/react';
import tippy, { type Instance, type Props } from 'tippy.js';
import { getCitationDetails, searchCitations } from '@/services/citation.service';
import { getQuotes } from '@/services/quote.service';
import SuggestionList from './suggestion-list';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';


// --- Custom Image Extension ---
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      float: {
        default: null,
        renderHTML: attributes => ({
          style: attributes.float ? `float: ${attributes.float}; margin: 0.5rem;` : ''
        }),
      },
      display: {
        default: 'block',
        renderHTML: attributes => ({
          style: `display: ${attributes.display};`
        })
      }
    };
  },
});

// --- Note Node (Footnote/Special Note) ---
export const NoteNode = Node.create({
  name: 'note',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      dataType: { default: 'footnote' },
      dataContent: { default: '' },
    };
  },

  parseHTML() {
    return [{
      tag: 'sup[data-type][data-content]',
      getAttrs: dom => {
        const type = (dom as HTMLElement).getAttribute('data-type');
        if (type === 'footnote' || type === 'specialnote') {
          return {
            dataType: type,
            dataContent: (dom as HTMLElement).getAttribute('data-content'),
          };
        }
        return false;
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes.dataType;
    const text = type === 'footnote' ? '[FN]' : '[SN]';
    return ['sup', HTMLAttributes, text];
  },
  
  addCommands() {
    return {
      setNote: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        });
      },
      unsetNote: () => ({ commands }) => {
        return commands.deleteSelection();
      },
    };
  },
});


// --- Citation Node ---
const CitationViewComponent = ({ node }: { node: any }) => (
  <NodeViewWrapper as="span" className="bg-blue-100 text-blue-800 p-1 rounded-sm font-mono text-xs">
    [[{node.attrs.refId}]]
  </NodeViewWrapper>
);
export const CitationNode = Node.create({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return { refId: { default: null } };
  },
  parseHTML() {
    return [{ 
      tag: 'span[data-citation][data-ref-id]',
      getAttrs: dom => ({ refId: (dom as HTMLElement).getAttribute('data-ref-id') }),
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-citation': 'true' }, `[[${HTMLAttributes.refId}]]`];
  },
});

// --- TOC Mark ---
export const TocMark = Mark.create({
    name: 'tocMark',
    addAttributes() {
      return { tocId: { default: null } };
    },
    parseHTML() { return [{ tag: 'span[data-toc-mark]' }] },
    renderHTML({ HTMLAttributes }) { return ['span', {'data-toc-mark': 'true', ...HTMLAttributes}, 0] },
    addCommands() {
        return {
            toggleTocMark: () => ({ commands }) => {
                return commands.toggleMark(this.name)
            },
        }
    },
});

// --- Heading ID Plugin ---
export function headingIdPlugin() {
  return new Plugin({
    key: new PluginKey('headingId'),
    appendTransaction: (transactions, oldState, newState) => {
      if (!transactions.some(tr => tr.docChanged)) return null;
      const { tr } = newState;
      let modified = false;

      newState.doc.descendants((node, pos) => {
        if (node.type.name.startsWith('heading') && (!node.attrs.id || node.attrs.id.trim() === '')) {
          const id = node.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          if (id) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
            modified = true;
          }
        }
      });

      return modified ? tr : null;
    },
  });
}

// --- Font Size Extension ---
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
          renderHTML: attributes => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// --- Suggestion Logic ---
const suggestionRenderer = () => {
    let component: ReactRenderer<any, any>;
    let popup: Instance[];

    return {
        onStart: (props: any) => {
            if (typeof props.clientRect !== 'function') {
                return;
            }
            
            component = new ReactRenderer(SuggestionList, {
                props,
                editor: props.editor,
            });

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            });
        },
        onUpdate(props: any) {
            component.updateProps(props);
            if (typeof props.clientRect !== 'function') {
                return;
            }
            popup[0].setProps({
                getReferenceClientRect: props.clientRect,
            });
        },
        onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
            }
            return component.ref?.onKeyDown(props);
        },
        onExit() {
            if (popup && popup[0]) {
                popup[0].destroy();
            }
            if (component) {
                component.destroy();
            }
        },
    };
};

// --- Custom Suggestion Extensions ---

export const CitationSuggestion = Extension.create({
    name: 'citationSuggestion',
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                char: '[[',
                pluginKey: new PluginKey('citationSuggestion'),
                command: async ({ editor, range, props }) => {
                    const citation = await getCitationDetails(props.id);
                    if (citation) {
                        editor.chain().focus()
                          .deleteRange(range)
                          .insertContent(`${citation.sanskrit} [[${props.id}]] `)
                          .run();
                    } else {
                        editor.chain().focus().deleteRange(range).run();
                    }
                },
                items: async ({ query }) => {
                    if (query.length < 1) return [];
                    const citations = await searchCitations(query);
                    return citations.slice(0, 5).map(c => ({ id: c.refId, label: `${c.refId}: ${c.sanskrit.substring(0, 30)}...` }));
                },
                render: suggestionRenderer,
            })
        ]
    }
});


export const QuoteSuggestions = Extension.create({
    name: 'quoteSuggestions',
     addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                char: '"',
                pluginKey: new PluginKey('quoteSuggestion'),
                allow: ({ state, range }) => {
                    const $from = state.doc.resolve(range.from);
                    return $from.parent.type.name === 'paragraph' && $from.parent.content.size === 1;
                },
                command: ({ editor, range, props }) => {
                    editor.chain().focus().deleteRange(range).insertContent({
                        type: 'scholarlyQuote',
                        attrs: { 
                          text: props.quote, 
                          author: props.author 
                        },
                    }).run();
                },
                items: async ({ query }) => {
                    const allQuotes = await getQuotes();
                     if (!query) {
                        return allQuotes.slice(0, 5).map(q => ({ id: q.id, label: `“${q.quote.substring(0, 40)}...” - ${q.author}`, quote: q.quote, author: q.author }));
                    }
                    return allQuotes
                        .filter(q => q.quote.toLowerCase().includes(query.toLowerCase()) || q.author.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 5)
                        .map(q => ({
                            id: q.id,
                            label: `“${q.quote.substring(0, 40)}...” - ${q.author}`,
                            quote: q.quote,
                            author: q.author,
                        }));
                },
                render: suggestionRenderer,
            })
        ]
    }
});


// --- Paragraph Class Extension ---
export const ParagraphClassExtension = Extension.create({
  name: 'paragraphClass',
  addGlobalAttributes() {
    return [{
      types: ['paragraph'],
      attributes: { class: { default: null } },
    }];
  },
});

// --- Glossary Highlighter ---
export const GlossaryHighlighterExtension = Extension.create<{terms: any[], colorTheme: any}>({
    name: 'glossaryHighlighter',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('glossaryHighlighter'),
                state: {
                    init: (_, { doc }) => ({ deco: this.options.terms, color: this.options.colorTheme }),
                    apply: (tr, value) => {
                        return { deco: this.options.terms, color: this.options.colorTheme };
                    },
                },
            }),
        ];
    },
});

// --- Version Word Mark ---
export const VersionWordMark = Mark.create({
  name: 'versionWord',
  addAttributes() {
    return {
      version: { default: null },
      author: { default: null },
    };
  },
  parseHTML() { return [{ tag: 'span[data-version-word]' }] },
  renderHTML({ HTMLAttributes }) { return ['span', HTMLAttributes, 0] },
});

// --- Custom Blockquote ---
export const ScholarlyQuoteNode = Node.create({
  name: 'scholarlyQuote',
  group: 'block',
  content: 'inline*',
  
  addAttributes() {
    return {
      text: {
        default: '',
      },
      author: {
        default: '',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'blockquote.scholarly-quote',
        getAttrs: dom => {
            const text = (dom as HTMLElement).querySelector('p')?.textContent?.replace(/^“|”$/g, '') || '';
            const author = (dom as HTMLElement).querySelector('footer')?.textContent?.replace(/^: /, '') || '';
            return { text, author };
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const text = node.attrs.text || '';
    const author = node.attrs.author || '';
    
    return [
      'blockquote',
      mergeAttributes(HTMLAttributes, { class: 'scholarly-quote', 'data-author': author }),
      ['p', {}, `“${text}”`],
    ]
  },
});
