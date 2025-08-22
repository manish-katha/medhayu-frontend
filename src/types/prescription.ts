
import { z } from 'zod';

export const prescriptionSettingsSchema = z.object({
    headerAlignment: z.enum(['left', 'center', 'right']),
    showLogo: z.boolean(),
    logoPlacement: z.enum(['left', 'center', 'right']),
    showClinicName: z.boolean(),
    showDoctorName: z.boolean(),
    addressPlacement: z.enum(['header', 'footer']),
    contactPlacement: z.enum(['header', 'footer']),
    showAddress: z.boolean(),
    showContact: z.boolean(),
    headerBackground: z.string(),
    textColor: z.string(),
    accentColor: z.string(),
    fontFamily: z.string(),
    showFooter: z.boolean(),
    footerText: z.string(),
    showWatermark: z.boolean(),
    watermarkOpacity: z.number(),
    headerBorderStyle: z.string(),
    bodyBackground: z.string(),
    showSignature: z.boolean(),
    signaturePlacement: z.enum(['left', 'center', 'right']),
    useLetterhead: z.boolean(),
    enableBarcode: z.boolean(),
});

export type PrescriptionSettings = z.infer<typeof prescriptionSettingsSchema>;


// For prescription data
export interface Medicine {
  id: number;
  name: string;
  anupaan: string;
  dosage: string;
  timing: string;
  customTiming?: string;
  customAnupaan?: string;
}

export interface Prescription {
  id: string;
  patientId: number;
  medicines: Medicine[];
  diagnosticTests: string[];
  specialInstructions: string;
  dietInstructions: string;
  nextVisitDate?: string;
  trackProgress?: boolean;
}
