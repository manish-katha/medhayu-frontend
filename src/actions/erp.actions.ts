
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { invoiceSchema, purchaseBillSchema, purchaseOrderSchema, salesReturnSchema } from '@/types/erp';
import { addInvoice, addPurchaseBill, addPurchaseOrder, addSalesReturn, getInvoices, getPurchaseOrders, getSalesReturns, deletePurchaseOrder as deletePurchaseOrderFromService } from '@/services/erp.service';
import { getErpSettings, saveErpSettings } from './settings.actions';
import { format } from 'date-fns';
import { getInventoryItems, updateInventoryItem } from '@/services/inventory.service';
import { InventoryItem } from '@/types/inventory';
import { addVendor, getVendorByName, getVendors } from '@/services/vendor.service';
import { CartItem } from '@/components/MarketPlace/CartDialog';

// ===== Document Number Generation =====
type DocumentType = 'invoice' | 'po' | 'return' | 'pb';

export async function generateNextDocumentNumber(type: DocumentType): Promise<string> {
    const settings = await getErpSettings();
    let formatDetails;
    let nextNumber;
    let mandatoryPrefix = '';
    let generatedPart = '';

    if (settings.autoNumbering) {
        const date = new Date();
        const yy = format(date, 'yy');
        const mm = format(date, 'MM');
        
        let lastNumber = 0;
        if (type === 'invoice') {
             const invoices = await getInvoices();
             lastNumber = invoices.length;
             mandatoryPrefix = 'INV-';
        } else if (type === 'po') {
            const pos = await getPurchaseOrders();
            lastNumber = pos.length;
            mandatoryPrefix = 'PO-';
        } else if (type === 'pb') {
            // Assuming pb for purchase bill, will need a service for it
            const pbs = await readJsonFile(path.join(corpusPath, 'purchase_bills.json'), [])
            lastNumber = pbs.length;
            mandatoryPrefix = 'PB-';
        }
        else {
            const returns = await getSalesReturns();
            lastNumber = returns.length;
            mandatoryPrefix = 'SALRE-';
        }
        
        const randomNumber = (lastNumber + 1).toString().padStart(5, '0');
        const clinic = settings.clinicName?.substring(0, 3).toUpperCase() || 'CLK';
        const doctor = settings.doctorName?.substring(0, 4).toUpperCase() || 'DOC';
        
        generatedPart = `${clinic}/${yy}${mm}-${randomNumber}-${doctor}`;

    } else {
        switch(type) {
            case 'invoice': 
                formatDetails = settings.invoiceFormat;
                nextNumber = settings.invoiceFormat.nextNumber;
                settings.invoiceFormat.nextNumber++;
                mandatoryPrefix = 'INV-';
                break;
            case 'po': 
                formatDetails = settings.poFormat;
                nextNumber = settings.poFormat.nextNumber;
                settings.poFormat.nextNumber++;
                mandatoryPrefix = 'PO-';
                break;
            case 'pb': // Purchase Bill
                 // Placeholder, needs its own format settings
                nextNumber = (await readJsonFile(path.join(corpusPath, 'purchase_bills.json'), [])).length + 1
                mandatoryPrefix = 'PB-';
                break;
            case 'return': 
                formatDetails = settings.returnFormat;
                nextNumber = settings.returnFormat.nextNumber;
                settings.returnFormat.nextNumber++;
                mandatoryPrefix = 'SALRE-';
                break;
            default:
                throw new Error("Invalid document type");
        }

        if (type !== 'pb' && type !== 'invoice') {
            await saveErpSettings(settings);
        }
        
        generatedPart = formatDetails ? `${formatDetails.prefix || ''}${nextNumber}${formatDetails.suffix || ''}`: `${nextNumber}`;
    }

    return `${mandatoryPrefix}${generatedPart}`;
}

// ===== Sales Invoice Actions =====

export async function createSalesInvoice(prevState: any, formData: FormData) {
  // We expect the client to stringify the JSON data
  const jsonData = formData.get('jsonData') as string;
  if (!jsonData) {
    return { error: 'Missing form data.' };
  }
  const data = JSON.parse(jsonData);

  // Convert date string back to Date object for validation
  data.date = new Date(data.date);

  const validatedFields = invoiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addInvoice(validatedFields.data);
    revalidatePath('/erp/billing');
    revalidatePath('/erp/documents');
    revalidatePath(`/patients/${validatedFields.data.patientId}`);
    return { success: true, data: validatedFields.data };
  } catch (error: any) {
    return { error: `Failed to create invoice: ${error.message}` };
  }
}


// ===== Purchase Order Actions =====

export async function createPurchaseOrder(prevState: any, formData: FormData) {
  const jsonData = formData.get('jsonData') as string;
  if (!jsonData) {
    return { error: 'Missing form data.' };
  }
  const data = JSON.parse(jsonData);

  // Convert date strings back to Date objects
  data.date = new Date(data.date);
  data.expectedDate = new Date(data.expectedDate);
  
  const validatedFields = purchaseOrderSchema.safeParse(data);
  
  if (!validatedFields.success) {
      console.log(validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addPurchaseOrder(validatedFields.data);
    revalidatePath('/erp/purchases'); // or a dedicated PO page
    revalidatePath('/erp/documents');
    return { success: true, data: validatedFields.data };
  } catch (error: any) {
    return { error: `Failed to create purchase order: ${error.message}` };
  }
}

export async function createPurchaseOrdersFromCart(cartItems: CartItem[]): Promise<{ success: boolean; poCount?: number; error?: string }> {
    try {
        const vendors = await getVendors();
        const itemsByVendor = cartItems.reduce((acc, item) => {
            (acc[item.vendorId] = acc[item.vendorId] || []).push(item);
            return acc;
        }, {} as Record<string, CartItem[]>);

        let createdCount = 0;

        for (const vendorId in itemsByVendor) {
            const vendorItems = itemsByVendor[vendorId];
            const poNumber = await generateNextDocumentNumber('po');
            const vendor = vendors.find(v => v.id === vendorId);
            
            const newPO = {
                id: poNumber,
                poNumber: poNumber,
                vendorId: vendorId,
                vendorName: vendor?.name,
                date: new Date(),
                expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                branchId: 'main', // Default branch
                items: vendorItems.map(item => ({
                    id: String(item.id),
                    itemName: item.name,
                    quantity: item.quantity,
                    rate: item.price,
                    unit: 'units', // This should probably be more dynamic
                    gst: 18, // Assuming a default GST
                })),
                status: 'Sent' as const,
            };
            
            await addPurchaseOrder(newPO);
            createdCount++;
        }

        revalidatePath('/erp/purchases');
        revalidatePath('/erp/documents');
        return { success: true, poCount: createdCount };

    } catch (error: any) {
        console.error("Error creating POs from cart:", error);
        return { success: false, error: 'Failed to create purchase orders from cart.' };
    }
}


export async function deletePurchaseOrder(id: string) {
    try {
        await deletePurchaseOrderFromService(id);
        revalidatePath('/erp/purchases');
        revalidatePath('/erp/documents');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Failed to delete purchase order.' };
    }
}

// ===== Purchase Bill Actions =====
export async function createPurchaseBill(prevState: any, formData: FormData) {
    const jsonData = formData.get('jsonData') as string;
    if (!jsonData) {
        return { error: 'Missing form data.' };
    }
    const data = JSON.parse(jsonData);
    data.billDate = new Date(data.billDate);

    const validatedFields = purchaseBillSchema.safeParse(data);

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            error: 'Validation failed.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    let billData = validatedFields.data;
    
    try {
        // If no PO is linked, create a new one automatically
        if (!billData.purchaseOrderId) {
             if (!billData.vendorId && billData.vendorName) {
                // Check if vendor exists by name, if not create it
                let vendor = await getVendorByName(billData.vendorName);
                if (!vendor) {
                    vendor = await addVendor({
                        name: billData.vendorName,
                        phone: 'N/A', // Placeholder, user should update later
                        address: billData.vendorAddress || 'N/A', // Placeholder
                        gstin: billData.vendorGstin || '',
                    });
                }
                billData.vendorId = vendor.id!;
            }
            
            if (!billData.vendorId) {
                throw new Error("Vendor details are required to create a new purchase order.");
            }

            const poNumber = await generateNextDocumentNumber('po');
            const newPO = {
                id: poNumber,
                poNumber: poNumber,
                vendorId: billData.vendorId,
                date: new Date(),
                expectedDate: new Date(),
                branchId: 'main', // Default branch
                items: billData.items.map(item => ({...item, quantity: item.receivedQty })),
                status: 'Completed' as const,
            };
            await addPurchaseOrder(newPO);
            billData.purchaseOrderId = poNumber;
        }

        // Step 1: Add the purchase bill to the database
        await addPurchaseBill(billData);
        
        // Step 2: Update inventory stock for each received item
        const inventoryItems = await getInventoryItems();
        const updatePromises: Promise<any>[] = [];

        for (const billItem of billData.items) {
            if (billItem.receivedQty > 0) {
                const inventoryItem = inventoryItems.find(inv => inv.name === billItem.itemName);
                
                if (inventoryItem && inventoryItem.id) {
                    const newStock = (inventoryItem.stock || 0) + billItem.receivedQty;
                    updatePromises.push(
                        updateInventoryItem(inventoryItem.id, { stock: newStock })
                    );
                }
            }
        }
        
        await Promise.all(updatePromises);
        
        // Step 3: Revalidate paths to refresh UI
        revalidatePath('/erp/purchases');
        revalidatePath('/erp/documents');
        revalidatePath('/erp/inventory'); // IMPORTANT: Revalidate inventory page
        
        return { success: true, data: billData };
    } catch (error: any) {
        console.error("Error creating purchase bill or updating inventory:", error);
        return { error: `Failed to create purchase bill: ${error.message}` };
    }
}


// ===== Sales Return Actions =====

export async function createSalesReturn(prevState: any, formData: FormData) {
    const jsonData = formData.get('jsonData') as string;
    if (!jsonData) {
      return { error: 'Missing form data.' };
    }
    const data = JSON.parse(jsonData);

    data.returnDate = new Date(data.returnDate);

    const validatedFields = salesReturnSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
          error: 'Validation failed.',
          fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addSalesReturn(validatedFields.data);
        revalidatePath('/erp/sales');
        revalidatePath('/erp/documents');
        revalidatePath(`/patients/${validatedFields.data.patientId}`);
        return { success: true, data: validatedFields.data };
    } catch (error: any) {
        return { error: `Failed to create sales return: ${error.message}` };
    }
}

// Action to get an invoice by ID to populate the sales return form
export async function getInvoiceForReturn(invoiceId: string) {
    // In a real app, this would fetch from erp.service.ts
    // For now, returning mock data if the ID matches.
    const invoices = await getInvoices();
    const foundInvoice = invoices.find(inv => inv.invoiceNumber === invoiceId);

    if (foundInvoice) {
        const patient = { name: "Rajesh Kumar"}; // Mock patient
        return {
            success: true,
            invoice: {
                id: foundInvoice.id,
                patientId: foundInvoice.patientId,
                date: foundInvoice.date.toISOString(),
                patientName: patient.name,
                items: foundInvoice.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    unit: 'pcs',
                    rate: item.price,
                })),
            }
        };
    }
    return { success: false, error: "Invoice not found." };
}

// ===== GST Report Action =====

function escapeCsvCell(cell: any): string {
  const cellStr = String(cell ?? '');
  // If the cell contains a comma, a double quote, or a newline, wrap it in double quotes
  if (/[",\n]/.test(cellStr)) {
    // Within a double-quoted string, any double quote must be escaped by another double quote
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

export async function generateGstReport(startDate: Date, endDate: Date): Promise<{ success: boolean; csvData?: string; error?: string }> {
    try {
        const allInvoices = await getInvoices();
        const filteredInvoices = allInvoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= startDate && invDate <= endDate;
        });

        if (filteredInvoices.length === 0) {
            return { success: false, error: "No invoices found for the selected date range." };
        }

        const headers = [
            'Invoice Number', 'Invoice Date', 'Patient ID', 
            'HSN/SAC', 'Item Name', 'Quantity', 'Taxable Value', 
            'GST Rate (%)', 'CGST Amount', 'SGST Amount', 'Total Tax', 'Invoice Total'
        ];

        let csvRows = [headers.join(',')];
        let totalTaxableValue = 0;
        let totalCgst = 0;
        let totalSgst = 0;

        for (const invoice of filteredInvoices) {
            for (const item of invoice.items) {
                const taxableValue = item.qty * item.price * (1 - item.discount / 100);
                const gstRate = item.tax;
                // Assuming intra-state transaction for simplicity (CGST + SGST)
                const totalTaxOnItem = taxableValue * (gstRate / 100);
                const cgst = totalTaxOnItem / 2;
                const sgst = totalTaxOnItem / 2;

                totalTaxableValue += taxableValue;
                totalCgst += cgst;
                totalSgst += sgst;

                const row = [
                    escapeCsvCell(invoice.invoiceNumber),
                    escapeCsvCell(format(new Date(invoice.date), 'yyyy-MM-dd')),
                    escapeCsvCell(invoice.patientId),
                    escapeCsvCell(item.hsn),
                    escapeCsvCell(item.name),
                    escapeCsvCell(item.qty),
                    escapeCsvCell(taxableValue.toFixed(2)),
                    escapeCsvCell(gstRate.toFixed(2)),
                    escapeCsvCell(cgst.toFixed(2)),
                    escapeCsvCell(sgst.toFixed(2)),
                    escapeCsvCell(totalTaxOnItem.toFixed(2)),
                    escapeCsvCell(invoice.totalAmount.toFixed(2))
                ];
                csvRows.push(row.join(','));
            }
        }
        
        // Add summary rows
        csvRows.push(''); // Blank line
        csvRows.push('Summary,,,,,,,Total Taxable Value,Total CGST,Total SGST,Total Tax');
        const totalTax = totalCgst + totalSgst;
        csvRows.push(`,,,,,,,${totalTaxableValue.toFixed(2)},${totalCgst.toFixed(2)},${totalSgst.toFixed(2)},${totalTax.toFixed(2)}`);

        return { success: true, csvData: csvRows.join('\n') };

    } catch (error: any) {
        console.error("Error generating GST report:", error);
        return { success: false, error: 'Failed to generate GST report.' };
    }
}

// Action to get a PO by ID to populate the purchase bill form
export async function getPurchaseOrderForBill(poNumber: string) {
    const pos = await getPurchaseOrders();
    const foundPO = pos.find(po => po.poNumber === poNumber);

    if (foundPO) {
        return {
            success: true,
            purchaseOrder: foundPO
        };
    }
    return { success: false, error: "Purchase Order not found." };
}

// Needed for auto-creation of vendors
import { readJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';
