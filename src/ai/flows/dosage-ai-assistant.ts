'use server';

/**
 * @fileOverview An AI assistant to help determine the appropriate dosage of Ayurvedic medicine.
 *
 * - getDosageSuggestion - A function that handles the dosage suggestion process.
 * - DosageAiAssistantInput - The input type for the getDosageSuggestion function.
 * - DosageAiAssistantOutput - The return type for the getDosageSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DosageAiAssistantInputSchema = z.object({
  patientAge: z.number().describe('The age of the patient in years.'),
  patientWeight: z.number().describe('The weight of the patient in kilograms.'),
  patientCondition: z.string().describe('A description of the patient\'s medical condition.'),
  medicineName: z.string().describe('The name of the Ayurvedic medicine.'),
  knownAllergies: z.string().describe('Known allergies of the patient, if any.'),
  patientPrakriti: z.string().describe('The patients Prakriti (body constitution) - Vata, Pitta, or Kapha.'),
});
export type DosageAiAssistantInput = z.infer<typeof DosageAiAssistantInputSchema>;

const DosageAiAssistantOutputSchema = z.object({
  suggestedDosage: z.string().describe('The suggested dosage of the medicine, including frequency and timing.'),
  rationale: z.string().describe('The rationale for the suggested dosage based on the patient\'s characteristics and condition.'),
  safetyInstructions: z.string().describe('Important safety instructions and precautions related to the medicine and dosage.'),
});
export type DosageAiAssistantOutput = z.infer<typeof DosageAiAssistantOutputSchema>;

export async function getDosageSuggestion(input: DosageAiAssistantInput): Promise<DosageAiAssistantOutput> {
  return dosageAiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dosageAiAssistantPrompt',
  input: {schema: DosageAiAssistantInputSchema},
  output: {schema: DosageAiAssistantOutputSchema},
  prompt: `You are an expert Ayurvedic doctor providing dosage suggestions for Ayurvedic medicines.

  Based on the following patient information and the medicine details, provide a suggested dosage, rationale, and safety instructions.

  Patient Age: {{{patientAge}}}
  Patient Weight: {{{patientWeight}}}
  Patient Condition: {{{patientCondition}}}
  Medicine Name: {{{medicineName}}}
  Known Allergies: {{{knownAllergies}}}
  Patient Prakriti: {{{patientPrakriti}}}

  Provide a detailed suggested dosage, a clear rationale explaining why you recommend this dosage, and important safety instructions for the patient.
  Ensure the dosage is safe and effective, taking into account all available information.
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const dosageAiAssistantFlow = ai.defineFlow(
  {
    name: 'dosageAiAssistantFlow',
    inputSchema: DosageAiAssistantInputSchema,
    outputSchema: DosageAiAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
