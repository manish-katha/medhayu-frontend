// KnowledgeBaseSearch
'use server';
/**
 * @fileOverview Knowledge Base Search AI agent.
 *
 * - knowledgeBaseSearch - A function that handles the knowledge base search process.
 * - KnowledgeBaseSearchInput - The input type for the knowledgeBaseSearch function.
 * - KnowledgeBaseSearchOutput - The return type for the knowledgeBaseSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KnowledgeBaseSearchInputSchema = z.object({
  query: z.string().describe('The search query to use when searching the knowledge base.'),
});
export type KnowledgeBaseSearchInput = z.infer<typeof KnowledgeBaseSearchInputSchema>;

const KnowledgeBaseSearchOutputSchema = z.object({
  results: z.array(z.string()).describe('The search results from the knowledge base.'),
});
export type KnowledgeBaseSearchOutput = z.infer<typeof KnowledgeBaseSearchOutputSchema>;

export async function knowledgeBaseSearch(input: KnowledgeBaseSearchInput): Promise<KnowledgeBaseSearchOutput> {
  return knowledgeBaseSearchFlow(input);
}

const knowledgeBaseSearchPrompt = ai.definePrompt({
  name: 'knowledgeBaseSearchPrompt',
  input: {schema: KnowledgeBaseSearchInputSchema},
  output: {schema: KnowledgeBaseSearchOutputSchema},
  prompt: `You are an expert in Ayurvedic medicine.  A doctor is asking you to search a knowledge base for relevant information. Return the results of the knowledge base in the requested output format.  Here is the query: {{{query}}}`,
});

const knowledgeBaseSearchFlow = ai.defineFlow(
  {
    name: 'knowledgeBaseSearchFlow',
    inputSchema: KnowledgeBaseSearchInputSchema,
    outputSchema: KnowledgeBaseSearchOutputSchema,
  },
  async input => {
    const {output} = await knowledgeBaseSearchPrompt(input);
    return output!;
  }
);
