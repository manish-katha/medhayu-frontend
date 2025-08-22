'use server';
/**
 * @fileOverview An AI flow to analyze structured lab report data and provide clinical insights.
 *
 * - analyzeLabReport - Analyzes lab data from both modern and Ayurvedic perspectives.
 * - AnalyzeReportInput - The input type for the flow.
 * - ReportAnalysis - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeReportInputSchema = z.object({
  reportType: z.string().describe('The general type of the lab report (e.g., Complete Blood Count, MRI Brain).'),
  reportSummary: z.string().describe('The full summary or findings from the report, in Markdown format.'),
});
export type AnalyzeReportInput = z.infer<typeof AnalyzeReportInputSchema>;

const AnalysisSectionSchema = z.object({
  problem: z.string().describe('A clear, concise summary of the problem identified.'),
  condition: z.string().describe('The likely condition or diagnosis.'),
  furtherTests: z.string().describe('Recommended further tests or investigations.'),
  prognosis: z.string().describe('The estimated time to cure or manage the condition and expected outcome.'),
});

const ReportAnalysisSchema = z.object({
  modern: AnalysisSectionSchema.describe('Analysis from a modern allopathic medicine perspective.'),
  ayurvedic: AnalysisSectionSchema.describe('Analysis from an Ayurvedic perspective, using Ayurvedic terminology (e.g., dosha, dhatu, srotas).'),
});
export type ReportAnalysis = z.infer<typeof ReportAnalysisSchema>;

export async function analyzeLabReport(input: AnalyzeReportInput): Promise<ReportAnalysis> {
  return analyzeLabReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLabReportPrompt',
  input: { schema: AnalyzeReportInputSchema },
  output: { schema: ReportAnalysisSchema },
  prompt: `You are an expert medical diagnostician, skilled in both modern allopathic medicine and traditional Ayurveda.
  
Your task is to analyze the following lab report findings and provide a dual analysis.

Report Type: {{{reportType}}}
Report Summary:
{{{reportSummary}}}

Provide two separate analyses:
1.  **Modern Perspective**: Based on standard allopathic practice.
2.  **Ayurvedic Perspective**: Based on Ayurvedic principles (dosha, dhatu, srotas, etc.).

For each perspective, you MUST answer the following four questions:
- **Problem**: What is the core problem indicated by the report?
- **Condition**: What is the name of the likely condition or disease?
- **Further Tests**: What further investigations are necessary, if any?
- **Prognosis**: What is the general prognosis and estimated time for cure or significant improvement?

Present the information clearly and concisely.`,
});

const analyzeLabReportFlow = ai.defineFlow(
  {
    name: 'analyzeLabReportFlow',
    inputSchema: AnalyzeReportInputSchema,
    outputSchema: ReportAnalysisSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
