
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

export const patientIdSettingsSchema = z.object({
    prefix: z.string().optional().default('OPDO-'),
    nextNumber: z.coerce.number().min(1).default(1),
    suffix: z.string().optional().default(''),
});

export type PatientIdSettings = z.infer<typeof patientIdSettingsSchema>;

const numberFormatSchema = z.object({
    prefix: z.string().max(10).optional(),
    nextNumber: z.coerce.number().min(1),
    suffix: z.string().max(10).optional(),
});

export const erpSettingsSchema = z.object({
    autoNumbering: z.boolean().default(true),
    clinicName: z.string().max(3, "Abbreviation must be 3 letters or less.").default('OSH'),
    doctorName: z.string().max(4, "Suffix must be 4 letters or less.").default('DOC'),
    invoiceFormat: numberFormatSchema.default({ prefix: 'INV-', nextNumber: 1, suffix: '' }),
    poFormat: numberFormatSchema.default({ prefix: 'PO-', nextNumber: 1, suffix: '' }),
    returnFormat: numberFormatSchema.default({ prefix: 'SALRE-', nextNumber: 1, suffix: '' }),
    // Inventory Settings
    trackInventory: z.boolean().default(true),
    defaultLowStockThreshold: z.coerce.number().min(0).default(10),
    expiryAlertDays: z.coerce.number().min(0).default(30),
    // Billing Settings
    currency: z.string().default('INR'),
    defaultPaymentTerms: z.string().default('Due on receipt'),
    invoiceFooter: z.string().optional(),
    enabledPaymentMethods: z.array(z.string()).default(['Cash', 'Card', 'UPI']),
});

export type ErpSettings = z.infer<typeof erpSettingsSchema>;
