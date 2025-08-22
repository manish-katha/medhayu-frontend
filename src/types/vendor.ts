
import { z } from 'zod';

export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Vendor name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().min(10, "A valid phone number is required"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  address: z.string().min(5, "Address is required"),
  gstin: z.string().length(15, "GSTIN must be 15 characters").optional().or(z.literal('')),
  pan: z.string().length(10, "PAN must be 10 characters").optional().or(z.literal('')),
  bankDetails: z.object({
    accountHolderName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    ifscCode: z.string(),
  }).optional(),
  upiId: z.string().optional(),
});

export type Vendor = z.infer<typeof vendorSchema>;
