
'use server';
/**
 * @fileOverview An AI flow to extract text from a PDF document.
 *
 * - extractPdfText - Extracts text from a PDF provided as a data URI.
 * - ExtractPdfTextInput - The input type for the flow.
 * - ExtractPdfTextOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractPdfTextInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractPdfTextInput = z.infer<typeof ExtractPdfTextInputSchema>;

const ExtractPdfTextOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the PDF.'),
});
export type ExtractPdfTextOutput = z.infer<typeof ExtractPdfTextOutputSchema>;


export async function extractPdfText(input: ExtractPdfTextInput): Promise<ExtractPdfTextOutput> {
  return extractPdfTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPdfTextPrompt',
  input: { schema: ExtractPdfTextInputSchema },
  output: { schema: ExtractPdfTextOutputSchema },
  prompt: `You are an Optical Character Recognition (OCR) expert. Extract all the text from the following PDF document.

PDF Document:
{{media url=pdfDataUri}}
`,
});


const extractPdfTextFlow = ai.defineFlow(
  {
    name: 'extractPdfTextFlow',
    inputSchema: ExtractPdfTextInputSchema,
    outputSchema: ExtractPdfTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
