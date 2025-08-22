
import type { Editor } from '@tiptap/react';
import type { GlossaryTerm } from '@/types';

const colorMap: Record<string, string> = {
  saffron: '#F4A261', // A saffron-like color
  blue: '#2A9D8F',    // A teal/blue color
  green: '#264653',   // A dark green color
  gray: '#E9C46A',    // A grayish-yellow color
};

export function findAndHighlightGlossaryTerms(editor: Editor, terms: GlossaryTerm[], colorTheme: keyof typeof colorMap) {
  const { state, view } = editor;
  const { tr } = state;
  let modified = false;

  const highlightColor = colorMap[colorTheme] || '#F4A261';

  // First, clear all existing highlights to avoid overlap
  tr.removeMark(0, state.doc.content.size, editor.schema.marks.highlight);

  // Iterate over each term in the glossary
  terms.forEach(term => {
    const keywords = [term.term, ...(term.aliases || [])];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      
      // Search through the document content
      state.doc.descendants((node, pos) => {
        if (!node.isText) {
          return true;
        }

        let match;
        while ((match = regex.exec(node.text!)) !== null) {
          const from = pos + match.index;
          const to = from + match[0].length;
          
          tr.addMark(from, to, editor.schema.marks.highlight.create({ color: highlightColor }));
          modified = true;
        }
        return true;
      });
    });
  });

  if (modified) {
    view.dispatch(tr);
  }
}
