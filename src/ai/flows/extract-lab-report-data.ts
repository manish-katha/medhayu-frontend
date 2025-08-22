
'use server';
/**
 * @fileOverview An AI flow to extract structured data from lab report text.
 *
 * - extractLabReportData - Extracts clinical data from raw text.
 * - ExtractLabReportInput - The input type for the flow.
 * - ExtractedLabData - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractLabReportInputSchema = z.object({
  reportText: z.string().describe('The raw text content of a lab report.'),
});
export type ExtractLabReportInput = z.infer<typeof ExtractLabReportInputSchema>;

const ExtractedLabDataSchema = z.object({
  reportType: z.string().describe('The general type of the lab report, determined from its contents (e.g., Complete Blood Count, Lipid Profile, MRI Brain).'),
  testResults: z.array(z.object({
      testName: z.string().describe('The name of the lab test.'),
      value: z.string().describe('The result value of the test.'),
      unit: z.string().describe('The unit of measurement for the test result.'),
      referenceRange: z.string().describe('The normal or reference range for the test.'),
  })).describe('An array of structured lab test results. Should be empty if the report is narrative (like an MRI).'),
  summary: z.string().optional().describe('The full, extracted clinical text from the report. This should preserve the original structure and headings like "FINDINGS" and "IMPRESSION". The output should be formatted using Markdown.'),
});
export type ExtractedLabData = z.infer<typeof ExtractedLabDataSchema>;

export async function extractLabReportData(input: ExtractLabReportInput): Promise<ExtractedLabData> {
  return extractLabReportDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLabReportDataPrompt',
  input: { schema: ExtractLabReportInputSchema },
  output: { schema: ExtractedLabDataSchema },
  prompt: `You are a medical data extraction expert. Your task is to meticulously parse the following raw text from a lab report and extract ONLY the clinical data into a structured format.

First, analyze all the test names or the report content to determine a concise, overall type for the report (e.g., "Complete Blood Count", "Liver Function Test", "MRI Brain") and set it in the 'reportType' field.

Next, determine the report's format.
- If the report contains tabular data with clear test names, values, units, and ranges, populate the 'testResults' array.
- If the report is narrative (e.g., a radiology report like an MRI or CT scan), leave the 'testResults' array empty and instead provide the full extracted clinical text in the 'summary' field.
- For the extracted text, you MUST preserve the original structure and headings like "FINDINGS" and "IMPRESSION". Format the output using Markdown, with headings for sections and bullet points for lists.

**Crucially, you must aggressively ignore all non-clinical information.** This includes, but is not limited to:
- Hospital names, logos, and addresses
- Patient personal details (name, age, patient ID)
- Doctor names
- Dates of collection/reporting
- Any other header, footer, or boilerplate text.

Focus ONLY on the clinical findings. Do not summarize or paraphrase. Extract the complete, raw technical data as presented. If there is any clinical text, you must extract it. Do not output "No clinical data found" if there are any results or findings.

Report Text:
{{{reportText}}}
`,
});

const extractLabReportDataFlow = ai.defineFlow(
  {
    name: 'extractLabReportDataFlow',
    inputSchema: ExtractLabReportInputSchema,
    outputSchema: ExtractedLabDataSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
