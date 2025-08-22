
'use client';

import React from 'react';
import type { BookContent, ContentBlock, Article } from '@/types';
import { useBookTheme } from './BookThemeContext';
import { ThemeApplier } from './ThemeApplier';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { PublicArticleRenderer } from '@/components/medhayu/Article renderer/public-article-renderer';
import { TransliterationProvider } from '../transliteration-provider';
import { ArticleTocDisplay } from '../admin/article-toc-display';

// Create a comprehensive mock article to showcase all themeable elements
const mockPreviewArticle: Article = {
  verse: "Preview",
  title: "Theme Preview Article",
  content: [
    { id: 'h1', type: 'shloka', sanskrit: '<h1>Heading 1 (H1)</h1>' },
    { id: 'h2', type: 'shloka', sanskrit: '<h2>Heading 2 (H2)</h2>' },
    { id: 'h3', type: 'shloka', sanskrit: '<h3>Heading 3 (H3)</h3>' },
    { id: 'h4', type: 'shloka', sanskrit: '<h4>Heading 4 (H4)</h4>' },
    { id: 'h5', type: 'shloka', sanskrit: '<h5>Heading 5 (H5)</h5>' },
    { id: 'h6', type: 'shloka', sanskrit: '<h6>Heading 6 (H6)</h6>' },
    { id: 'p', type: 'shloka', sanskrit: '<p>This is a standard paragraph. It demonstrates the default body text styling for your book theme. You can adjust its font size, color, and family.</p>' },
    { id: 'sutra', type: 'sutra', sanskrit: '<p>अथातो ब्रह्मजिज्ञासा</p>', originalLang: 'sa' },
    { 
      id: 'bhashya', 
      type: 'bhashya', 
      sanskrit: '<p>This is a Bhashya block, typically used for primary commentary. It can be styled with italics or different colors to distinguish it.</p>',
      commentary: { type: 'bhashya', author: 'Ādi Śaṅkara', workName: 'Brahmasūtrabhāṣya', shortName: 'Śāṅkara Bhāṣya' }
    },
    {
        id: 'teeka',
        type: 'tika',
        sanskrit: '<p>This is a Tīkā block, a sub-commentary, which can have its own distinct style.</p>',
        commentary: { type: 'tika', author: 'Vācaspati Miśra', workName: 'Bhāmatī', shortName: 'Bhāmatī' }
    },
    { 
      id: 'notes-citations', 
      type: 'shloka', 
      sanskrit: `<p>Here is an example of a footnote<sup data-type="footnote" data-content="This is the content of the footnote."></sup>, a special note<sup data-type="specialnote" data-content="This is a special, more prominent note."></sup>, and a citation <span data-citation="true" data-ref-id="CS_Sutra_27.297"></span>.</p>`
    },
    {
      id: 'blockquote',
      type: 'shloka',
      sanskrit: '<blockquote data-author="Ancient Sage">To be without desires, or with all desires fulfilled, is to be without sorrow.</blockquote>'
    },
    {
      id: 'version',
      type: 'shloka',
      sanskrit: '<p>This word has <span data-versions="[&quot;multiple&quot;, &quot;various&quot;, &quot;several&quot;]" class="version-word">multiple</span> versions.</p>'
    }
  ],
  author: { id: 'preview', name: 'Theme Preview', avatarUrl: ''},
  createdAt: Date.now(),
  updatedAt: Date.now(),
};


export function BookThemeLivePreview({ bookContent }: { bookContent: BookContent }) {
    const { theme } = useBookTheme();

    return (
        <div className="relative h-full bg-muted/40 overflow-y-auto">
            {theme && <ThemeApplier theme={theme} scopeToId="theme-preview" />}
                <div id="theme-preview" className="p-8">
                     <Card className="shadow-lg">
                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
                            <TransliterationProvider>
                                <PublicArticleRenderer 
                                    blocks={mockPreviewArticle.content}
                                    articleInfo={{ book: bookContent, chapter: {id: 'preview', name: 'Preview Chapter', articles: []}, article: mockPreviewArticle }}
                                    bookmarks={[]}
                                    isGlossaryMode={false}
                                    glossary={[]}
                                    onHighlight={() => {}}
                                    // Disable interactive elements for preview
                                    onSelectText={() => {}}
                                />
                                <div className="border-l pl-4 hidden md:block">
                                    <ArticleTocDisplay blocks={mockPreviewArticle.content} />
                                </div>
                            </TransliterationProvider>
                        </CardContent>
                    </Card>
                </div>
        </div>
    );
}
