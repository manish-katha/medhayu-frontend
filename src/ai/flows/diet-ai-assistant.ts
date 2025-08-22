'use server';

/**
 * @fileOverview An AI assistant that suggests diet plans based on the patient's type and prescription.
 *
 * - suggestDietPlan - A function that handles the diet plan suggestion process.
 * - SuggestDietPlanInput - The input type for the suggestDietPlan function.
 * - SuggestDietPlanOutput - The return type for the suggestDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDietPlanInputSchema = z.object({
  patientType: z.string().describe('The patient type (e.g., Kapha, Pitta, Vata).'),
  prescription: z.string().describe('The patient prescription.'),
});
export type SuggestDietPlanInput = z.infer<typeof SuggestDietPlanInputSchema>;

const SuggestDietPlanOutputSchema = z.object({
  dietPlan: z.string().describe('The suggested diet plan for the patient.'),
});
export type SuggestDietPlanOutput = z.infer<typeof SuggestDietPlanOutputSchema>;

export async function suggestDietPlan(input: SuggestDietPlanInput): Promise<SuggestDietPlanOutput> {
  return suggestDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDietPlanPrompt',
  input: {schema: SuggestDietPlanInputSchema},
  output: {schema: SuggestDietPlanOutputSchema},
  prompt: `You are an expert Ayurvedic doctor specializing in diet plans.

You will use the patient's type and prescription to generate a diet plan.

Patient Type: {{{patientType}}}
Prescription: {{{prescription}}}

Diet Plan:`,
});

const suggestDietPlanFlow = ai.defineFlow(
  {
    name: 'suggestDietPlanFlow',
    inputSchema: SuggestDietPlanInputSchema,
    outputSchema: SuggestDietPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
