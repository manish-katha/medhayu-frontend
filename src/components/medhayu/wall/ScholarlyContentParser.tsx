
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PublicCitationTooltip } from '@/components/medhayu/Article renderer/public-citation-tooltip';
import parse, { domToReact, Element, HTMLReactParserOptions } from 'html-react-parser';

interface ScholarlyContentParserProps {
  content: string;
}

const parseScholarlyText = (text: string): React.ReactNode => {
  if (!text) return null;

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        // Handle custom blockquote with author
        if (domNode.name === 'blockquote' && domNode.attribs['data-author']) {
          const author = domNode.attribs['data-author'];
          return (
            <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-700 bg-indigo-50 py-2 px-3 rounded my-2">
              {domToReact(domNode.children, options)}
              {author && <footer className="text-right text-sm not-italic mt-2">- {author}</footer>}
            </blockquote>
          );
        }

        // Handle custom sup for notes
        if (domNode.name === 'sup' && domNode.attribs['datatype']) {
           const type = domNode.attribs['datatype'];
           const noteContent = domNode.attribs['datacontent'];
           if(type === 'footnote') {
                return <span className="bg-gray-50 border-l-4 border-gray-400 px-2 py-1 rounded-md mx-1 text-xs">Footnote: {noteContent}</span>;
           }
           if(type === 'specialnote') {
                return <span className="bg-yellow-50 border-l-4 border-yellow-400 px-2 py-1 rounded-md mx-1 text-xs">Note: {noteContent}</span>;
           }
        }
      }

      // Handle plain text for citations
      if (domNode.type === 'text') {
        const textContent = domNode.data;
        const parts = textContent.split(/(\[\[.*?\]\])/g);
        if (parts.length > 1) {
            return <>
                {parts.map((part, i) => {
                    if (part.startsWith('[[') && part.endsWith(']]')) {
                        const refId = part.slice(2, -2);
                        return <PublicCitationTooltip key={`${i}`} refId={refId} />;
                    }
                    return part;
                })}
            </>
        }
      }
    },
  };
  
  // This will now correctly parse the full HTML string
  return parse(text, options);
};


export const ScholarlyContentParser: React.FC<ScholarlyContentParserProps> = ({ content }) => {
    // A simple check to see if the content might be a stringified object
    // This is a temporary fix for the case study sharing issue.
    try {
        if (typeof content === 'string' && content.startsWith('{') && content.endsWith('}')) {
             const parsed = JSON.parse(content);
             return <p>{parsed.title || 'Attached Content'}</p>;
        }
    } catch(e) {
        // Not a JSON object, proceed as normal
    }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-[16px] leading-relaxed space-y-4">
      {parseScholarlyText(content)}
    </div>
  );
};
