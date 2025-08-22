
'use server';
/**
 * @fileOverview An AI flow to explain the content of a post.
 *
 * - explainPost - A function that handles the post explanation process.
 * - ExplainPostInput - The input type for the explainPost function.
 * - ExplainPostOutput - The return type for the explainPost function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainPostInputSchema = z.object({
  postContent: z.string().describe('The HTML content of the post to be explained.'),
});
export type ExplainPostInput = z.infer<typeof ExplainPostInputSchema>;

const ExplainPostOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the post content, providing context and significance where possible.'),
});
export type ExplainPostOutput = z.infer<typeof ExplainPostOutputSchema>;

export async function explainPost(input: ExplainPostInput): Promise<ExplainPostOutput> {
  return explainPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainPostPrompt',
  input: { schema: ExplainPostInputSchema },
  output: { schema: ExplainPostOutputSchema },
  prompt: `You are an expert Ayurvedic scholar. Your task is to explain the following post content in a clear and concise way. Provide context and significance where possible.

Post Content:
{{{postContent}}}
`,
});

const explainPostFlow = ai.defineFlow(
  {
    name: 'explainPostFlow',
    inputSchema: ExplainPostInputSchema,
    outputSchema: ExplainPostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
