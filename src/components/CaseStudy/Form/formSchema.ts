
import { z } from 'zod';

export const caseStudyFormSchema = z.object({
  patientId: z.number().optional(),
  patientDetails: z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    oid: z.string().optional().nullable(),
    cin: z.string().optional().nullable(),
  }),
  title: z.string().min(1, 'Title is required'),
  condition: z.string().min(1, 'Condition is required'),
  summary: z.string().min(1, 'Summary is required'),
  isPublic: z.boolean(),
  version: z.string().default('1.0'),
  clinicalPresentation: z.object({
    chiefComplaint: z.string().optional(),
    associatedComplaints: z.string().optional(),
    visitComplaint: z.string().optional(),
  }),
  medicationProtocol: z.object({
    medicines: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      timing: z.string(),
    })).optional(),
    specialInstructions: z.string().optional(),
  }),
  diagnosticFindings: z.object({
    reports: z.array(z.object({
      name: z.string(),
      date: z.string(), // ISO string
      summary: z.string(),
    })).optional(),
  }),
  ayurvedicAssessment: z.object({
    diagnosis: z.string().optional(),
    doshaImbalance: z.string().optional(),
  }),
  treatmentPlan: z.object({
    diet: z.string().optional(),
    lifestyle: z.string().optional(),
  }),
  outcomes: z.object({
    progressNotes: z.string().optional(),
    conclusion: z.string().optional(),
  }),
});

export type CaseStudyFormValues = z.infer<typeof caseStudyFormSchema>;
