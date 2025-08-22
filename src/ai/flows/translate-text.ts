
'use server';
/**
 * @fileOverview An AI flow to translate text to a specified language.
 *
 * - translateText - Translates text.
 * - TranslateTextInput - The input type for the flow.
 * - TranslateTextOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLang: z.string().describe('The BCP-47 language code to translate to (e.g., "hi" for Hindi, "es" for Spanish).'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const directTranslatePrompt = ai.definePrompt({
  name: 'directTranslatePrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text to {{targetLang}}. Do not translate words enclosed in [[double square brackets]] as they are citations.

Text:
{{{text}}}
`,
});

const translateToEnglishPrompt = ai.definePrompt({
    name: 'translateToEnglishPrompt',
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: z.object({ translation: z.string() }) },
    prompt: `Translate the following text to English. Do not translate words enclosed in [[double square brackets]] as they are citations.

Text:
{{{text}}}
`,
});


const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    // If the target is English, do a direct translation.
    if (input.targetLang === 'en') {
        const { output } = await directTranslatePrompt(input);
        return output!;
    }
    
    // Otherwise, first translate to English.
    const toEnglishResult = await translateToEnglishPrompt({ text: input.text });
    if (!toEnglishResult.output?.translation) {
        throw new Error("Failed to get intermediate English translation.");
    }

    // Then translate from English to the final target language.
    const finalResult = await directTranslatePrompt({
        text: toEnglishResult.output.translation,
        targetLang: input.targetLang
    });

    return finalResult.output!;
  }
);
