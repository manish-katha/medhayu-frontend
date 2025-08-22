
import { z } from 'zod';
import type { Quote } from './quote';

// Schemas for searchQuotesContextually flow
const QuoteSchema = z.object({
    id: z.string(),
    quote: z.string(),
    author: z.string(),
    source: z.string().optional(),
    categoryId: z.string(),
    title: z.string().optional(),
});

export const SearchQuotesContextuallyInputSchema = z.object({
  articleText: z.string(),
  quotes: z.array(QuoteSchema),
});
export type SearchQuotesContextuallyInput = z.infer<typeof SearchQuotesContextuallyInputSchema>;


export const SearchQuotesContextuallyOutputSchema = z.object({
  relevantQuotes: z.array(QuoteSchema),
});

export type SearchQuotesContextuallyOutput = z.infer<typeof SearchQuotesContextuallyOutputSchema>;
