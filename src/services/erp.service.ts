
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Invoice, PurchaseOrder, SalesReturn, PurchaseBill } from '@/types/erp';
import path from 'path';

// Define file paths
const invoicesFilePath = path.join(corpusPath, 'sales_invoices.json');
const purchaseOrdersFilePath = path.join(corpusPath, 'purchase_orders.json');
const salesReturnsFilePath = path.join(corpusPath, 'sales_returns.json');
const purchaseBillsFilePath = path.join(corpusPath, 'purchase_bills.json');

// ===== Invoice Functions =====

export async function getInvoices(): Promise<Invoice[]> {
  return readJsonFile<Invoice[]>(invoicesFilePath, []);
}

export async function addInvoice(invoiceData: Invoice): Promise<Invoice> {
  const invoices = await getInvoices();
  invoices.unshift(invoiceData); // Add to the beginning
  await writeJsonFile(invoicesFilePath, invoices);
  return invoiceData;
}

// ===== Purchase Order Functions =====

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return readJsonFile<PurchaseOrder[]>(purchaseOrdersFilePath, []);
}
  
export async function addPurchaseOrder(poData: PurchaseOrder): Promise<PurchaseOrder> {
    const purchaseOrders = await getPurchaseOrders();
    purchaseOrders.unshift(poData);
    await writeJsonFile(purchaseOrdersFilePath, purchaseOrders);
    return poData;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
    let pos = await getPurchaseOrders();
    pos = pos.filter(po => po.id !== id);
    await writeJsonFile(purchaseOrdersFilePath, pos);
}

// ===== Sales Return Functions =====

export async function getSalesReturns(): Promise<SalesReturn[]> {
    return readJsonFile<SalesReturn[]>(salesReturnsFilePath, []);
}

export async function addSalesReturn(returnData: SalesReturn): Promise<SalesReturn> {
    const salesReturns = await getSalesReturns();
    salesReturns.unshift(returnData);
    await writeJsonFile(salesReturnsFilePath, salesReturns);
    return returnData;
}

// ===== Purchase Bill Functions =====

export async function getPurchaseBills(): Promise<PurchaseBill[]> {
    return readJsonFile<PurchaseBill[]>(purchaseBillsFilePath, []);
}

export async function addPurchaseBill(billData: PurchaseBill): Promise<PurchaseBill> {
    const purchaseBills = await getPurchaseBills();
    purchaseBills.unshift(billData);
    await writeJsonFile(purchaseBillsFilePath, purchaseBills);
    return billData;
}
