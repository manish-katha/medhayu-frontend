
'use server';

/**
 * @fileOverview An AI assistant for handling WhatsApp conversations for the clinic.
 *
 * - generateWhatsAppResponse - A function that generates a response based on chat history.
 * - WhatsAppBotInput - The input type for the function.
 * - WhatsAppBotOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const WhatsAppBotInputSchema = z.object({
    chatHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).describe("The history of the conversation so far."),
    lastUserMessage: z.string().describe("The last message sent by the user."),
    config: z.object({
        greeting: z.string(),
        useAyurvedicForm: z.boolean(),
    }).describe("Configuration for how the bot should behave."),
});
export type WhatsAppBotInput = z.infer<typeof WhatsAppBotInputSchema>;

const WhatsAppBotOutputSchema = z.object({
  response: z.string().describe('The generated response from the assistant.'),
});
export type WhatsAppBotOutput = z.infer<typeof WhatsAppBotOutputSchema>;

// Define the input type for the external-facing function, which doesn't include lastUserMessage
const ExternalWhatsAppBotInputSchema = WhatsAppBotInputSchema.omit({ lastUserMessage: true });
type ExternalWhatsAppBotInput = z.infer<typeof ExternalWhatsAppBotInputSchema>;

export async function generateWhatsAppResponse(input: ExternalWhatsAppBotInput): Promise<WhatsAppBotOutput> {
  const lastUserMessage = input.chatHistory.length > 0 ? input.chatHistory[input.chatHistory.length - 1].content : "";
  const flowInput = { ...input, lastUserMessage };
  return whatsAppBotFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'whatsAppBotPrompt',
  input: { schema: WhatsAppBotInputSchema },
  output: { schema: WhatsAppBotOutputSchema },
  prompt: `You are a friendly and efficient virtual assistant for Oshadham Ayurvedic Clinic. Your name is Acharya.

Your primary role is to assist patients. You can help them book appointments, answer general questions about the clinic, and collect initial intake information.

- If the user wants to book an appointment, ask if they are a new or existing patient.
- If they are a new patient and the config 'useAyurvedicForm' is true, start collecting information based on a standard Ayurvedic intake form (ask for name, age, chief complaint, duration of problem). Ask one question at a time.
- If 'useAyurvedicForm' is false, just get their name and phone number to schedule the appointment.
- Be polite, concise, and helpful. Use "Namaste" as a greeting.
- Your initial greeting should be: {{{config.greeting}}}

Conversation History:
{{#each chatHistory}}
{{role}}: {{{content}}}
{{/each}}

Patient: {{{lastUserMessage}}}
Assistant:`,
});

const whatsAppBotFlow = ai.defineFlow(
  {
    name: 'whatsAppBotFlow',
    inputSchema: WhatsAppBotInputSchema,
    outputSchema: WhatsAppBotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
