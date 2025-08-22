
import { z } from 'zod';

export const inventoryItemSchema = z.object({
  id: z.string().optional(), // Optional on creation, will be added by the service
  name: z.string().min(2, "Name must be at least 2 characters"),
  imageUrl: z.string().optional(),
  sanskrit: z.string().optional(),
  dosage: z.string().optional(),
  anupaan: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative").default(0),
  lowStockThreshold: z.coerce.number().min(0).default(10),
  doshaEffects: z.array(z.string()).optional(),
  expiryDate: z.string().optional(),
  
  // Detailed fields from form
  itemClassification: z.enum(["classical", "proprietary"]).default("classical"),
  category: z.string().min(1, "Category is required"),
  itemType: z.string().min(1, "Item type is required"),
  serviceOrProduct: z.enum(["service", "product"]),
  unit: z.string().min(1, "Unit is required"),
  packageSize: z.string().optional(), // New field for quantity/package size
  openingStock: z.coerce.number().min(0).default(0),
  enableBatching: z.boolean().default(false),
  itemCode: z.string().optional(),
  hsnCode: z.string().optional(),
  description: z.string().optional(),
  stockAvailabilityDate: z.date().optional(),
  salePrice: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0).optional(),
  gstPercentage: z.coerce.number().min(0).max(100),
  batchNo: z.string().optional(),
  supplierInfo: z.string().optional(),
  customFields: z.array(z.object({
      name: z.string().min(1, "Field name cannot be empty."),
      value: z.string().min(1, "Field value cannot be empty."),
  })).optional().default([]),
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;
