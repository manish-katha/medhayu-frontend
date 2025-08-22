
import { z } from 'zod';

// ===== Invoice =====
export const invoiceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required'),
  hsn: z.string().optional(),
  batchNo: z.string().optional(),
  expDate: z.string().optional(),
  mfgDate: z.string().optional(),
  qty: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax: z.coerce.number().min(0).max(100).default(18),
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  patientId: z.coerce.number().min(1, "Patient is required."),
  date: z.date(),
  paymentMode: z.enum(['cash', 'card', 'upi', 'bank']),
  items: z.array(invoiceItemSchema).min(1, 'Invoice must have at least one item'),
  notes: z.string().optional(),
  additionalCharges: z.coerce.number().default(0),
  discountOnTotal: z.coerce.number().default(0),
  subtotal: z.number().default(0),
  totalAmount: z.number().default(0),
  status: z.enum(['Paid', 'Pending', 'Overdue', 'Draft']),
});
export type Invoice = z.infer<typeof invoiceSchema>;


// ===== Purchase Order =====
export const purchaseOrderItemSchema = z.object({
  id: z.string(),
  itemName: z.string().min(1, 'Item name is required'),
  itemDescription: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.coerce.number().min(0),
  gst: z.coerce.number().min(0).max(100).default(18),
});
export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;

export const purchaseOrderSchema = z.object({
  id: z.string(),
  poNumber: z.string(),
  vendorId: z.string().min(1, "Vendor is required"),
  vendorName: z.string().optional(),
  date: z.date(),
  expectedDate: z.date(),
  branchId: z.string().min(1, "Branch is required"),
  reference: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Partial', 'Completed', 'Cancelled']),
});
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;


// ===== Sales Return =====
const returnItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.coerce.number(), // original quantity
  price: z.coerce.number(),
  discount: z.coerce.number(),
  tax: z.coerce.number(),
  returnQty: z.coerce.number().min(0),
  reason: z.string().optional(),
});


export const salesReturnSchema = z.object({
    id: z.string(),
    returnDate: z.date(),
    invoiceId: z.string().min(1, "Original invoice ID is required"),
    patientId: z.coerce.number(),
    items: z.array(returnItemSchema).min(1),
    refundMethod: z.enum(['cash', 'bank-transfer', 'credit-note']),
    notes: z.string().optional(),
});
export type SalesReturn = z.infer<typeof salesReturnSchema>;

// ===== Purchase Bill =====
export const purchaseBillItemSchema = purchaseOrderItemSchema.extend({
  receivedQty: z.coerce.number().min(0),
});
export type PurchaseBillItem = z.infer<typeof purchaseBillItemSchema>;

export const purchaseBillSchema = z.object({
    id: z.string(),
    purchaseOrderId: z.string().optional(),
    vendorId: z.string().optional(), // Can be undefined if vendorName is provided
    vendorName: z.string().optional(),
    vendorAddress: z.string().optional(), // For new vendor creation
    vendorGstin: z.string().optional(), // For new vendor creation
    billNumber: z.string().min(1, "Supplier bill number is required."),
    billDate: z.date(),
    items: z.array(purchaseBillItemSchema).min(1, "Must have at least one item."),
    notes: z.string().optional(),
}).refine(data => data.purchaseOrderId || data.vendorId || data.vendorName, {
    message: "Either a Purchase Order or Vendor must be specified.",
    path: ["vendorId"], // Error points to vendor field
});
export type PurchaseBill = z.infer<typeof purchaseBillSchema>;
