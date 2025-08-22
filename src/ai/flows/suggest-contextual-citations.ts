
'use server';
/**
 * @fileOverview An AI flow to suggest contextual citations for an article.
 *
 * - suggestCitationsForArticle - Extracts keywords and suggests citations.
 * - SuggestCitationsInput - The input type for the flow.
 * - SuggestCitationsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { searchCitations } from '@/services/citation.service';
import type { Citation } from '@/types';

export interface SuggestionWithContext extends Citation {
  matchedKeyword: string;
  count: number;
}

const SuggestCitationsInputSchema = z.object({
  articleText: z.string().describe('The full text content of the article.'),
});
export type SuggestCitationsInput = z.infer<typeof SuggestCitationsInputSchema>;

const KeywordSchema = z.object({
  keyword: z.string().describe('A single, relevant Sanskrit or Ayurvedic keyword found in the text. Should be a noun or specific concept.'),
  count: z.number().describe('The number of times this keyword appears in the text.'),
});

const SuggestCitationsOutputSchema = z.object({
  suggestions: z.array(z.object({
    ...z.object(
        {
          id: z.string(),
          refId: z.string(),
          source: z.string(),
          sanskrit: z.string(),
          english: z.string(),
          keywords: z.array(z.string()),
        }
    ),
    matchedKeyword: z.string(),
    count: z.number(),
  })).describe('An array of citation suggestions relevant to the article content.'),
});
export type SuggestCitationsOutput = z.infer<typeof SuggestCitationsOutputSchema>;


export async function suggestCitationsForArticle(input: SuggestCitationsInput): Promise<SuggestCitationsOutput> {
  // Step 1: Extract keywords from the article text using an AI prompt.
  const keywordPrompt = ai.definePrompt({
    name: 'extractKeywordsPrompt',
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: z.object({ keywords: z.array(KeywordSchema) }) },
    prompt: `Analyze the following article text and extract the top 5-10 most relevant and frequently occurring Sanskrit or Ayurvedic clinical keywords. For each keyword, provide its exact text and a count of how many times it appears.

Article Text:
{{{text}}}
`,
  });

  const { output: keywordOutput } = await keywordPrompt({ text: input.articleText });
  const keywords = keywordOutput?.keywords || [];

  // Step 2: Search for citations for each extracted keyword.
  const citationPromises = keywords.map(async ({ keyword, count }) => {
    const searchResults = await searchCitations(keyword);
    // For each search result, attach the keyword that found it and its count.
    return searchResults.map(citation => ({
      ...citation,
      matchedKeyword: keyword,
      count: count,
    }));
  });

  // Step 3: Consolidate and rank the results.
  const allSuggestions = (await Promise.all(citationPromises)).flat();
  
  // A simple ranking: suggestions from more frequent keywords come first.
  allSuggestions.sort((a, b) => b.count - a.count);

  // Remove duplicate citations (by refId), keeping the one with the highest count.
  const uniqueSuggestions = allSuggestions.reduce((acc, current) => {
    if (!acc.some(item => item.refId === current.refId)) {
      acc.push(current);
    }
    return acc;
  }, [] as SuggestionWithContext[]);


  return { suggestions: uniqueSuggestions.slice(0, 15) }; // Limit to top 15 suggestions
}
