
'use server';
/**
 * @fileOverview An AI flow to extract structured data from purchase bill text.
 *
 * - extractPurchaseBillData - Extracts details from a raw bill text.
 * - ExtractPurchaseBillInput - The input type for the flow.
 * - ExtractedBillData - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractPurchaseBillInputSchema = z.object({
  billText: z.string().describe('The raw text content of a purchase bill or invoice.'),
});
export type ExtractPurchaseBillInput = z.infer<typeof ExtractPurchaseBillInputSchema>;

const ExtractedBillDataSchema = z.object({
  vendorName: z.string().optional().describe('The name of the vendor or supplier.'),
  vendorAddress: z.string().optional().describe("The full address of the vendor, if present."),
  vendorGstin: z.string().optional().describe("The GSTIN or Tax ID of the vendor, if present."),
  billNumber: z.string().optional().describe('The invoice or bill number.'),
  billDate: z.string().optional().describe('The date of the bill in YYYY-MM-DD format.'),
  items: z.array(z.object({
      itemName: z.string().describe('The name of the product or item purchased.'),
      quantity: z.number().describe('The quantity of the item.'),
      rate: z.number().describe('The price or rate per unit of the item.'),
  })).describe('An array of structured line items from the bill.'),
  totalAmount: z.number().optional().describe('The final total amount of the bill.'),
});
export type ExtractedBillData = z.infer<typeof ExtractedBillDataSchema>;

export async function extractPurchaseBillData(input: ExtractPurchaseBillInput): Promise<ExtractedBillData> {
  return extractPurchaseBillDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPurchaseBillDataPrompt',
  input: { schema: ExtractPurchaseBillInputSchema },
  output: { schema: ExtractedBillDataSchema },
  prompt: `You are an expert data extraction agent for an accounting system. Your task is to parse the following raw text from a supplier's purchase bill and extract the data into a structured format.

Focus on identifying the following key pieces of information:
- Vendor Name
- Vendor's full Address
- Vendor's GSTIN or Tax ID
- Bill or Invoice Number
- Bill Date
- A list of all line items, including their name, quantity, and rate/price.
- The final, grand total amount of the bill (labeled as 'Total Amount Chargeable', 'Total', or similar).

Ignore all other information like addresses, other tax details (like individual IGST amounts), and contact numbers. Focus ONLY on the requested fields.

Bill Text:
{{{billText}}}
`,
});

const extractPurchaseBillDataFlow = ai.defineFlow(
  {
    name: 'extractPurchaseBillDataFlow',
    inputSchema: ExtractPurchaseBillInputSchema,
    outputSchema: ExtractedBillDataSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
