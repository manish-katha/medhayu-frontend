
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Barcode, Plus, Trash2, CreditCard, CircleDollarSign, Percent, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { invoiceSchema, Invoice, InvoiceItem } from '@/types/erp';
import { createSalesInvoice, generateNextDocumentNumber } from '@/actions/erp.actions';
import { useToast } from '@/hooks/use-toast';
import PatientSearchDropdown from '../Patients/PatientSearchDropdown';
import { PatientData } from '@/types/patient';
import { getInventoryItems } from '@/services/inventory.service';
import InventoryItemForm from '../Inventory/InventoryItemForm';
import { InventoryItem } from '@/types/inventory';
import BarcodeScanner from './BarcodeScanner';
import { getDatabase, ref, set, onValue, off } from "firebase/database";
import { app } from '@/lib/firebase';

const SESSION_ID = "clinic-session-1"; // In a real app, this should be dynamic

export const SalesInvoiceForm = () => {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createSalesInvoice, null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | undefined>(undefined);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    getInventoryItems().then(setInventory);
  }, []);

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date(),
      items: [],
      paymentMode: 'cash',
      status: 'Draft',
      additionalCharges: 0,
      discountOnTotal: 0,
    },
  });
  
  const { control, register, handleSubmit, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name && (name.startsWith('items') || name === 'additionalCharges' || name === 'discountOnTotal')) {
        const items = value.items || [];
        const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price * (1 - item.discount / 100)), 0);
        const totalAmount = subtotal + Number(value.additionalCharges || 0) - Number(value.discountOnTotal || 0);
        setValue('subtotal', subtotal, { shouldValidate: true });
        setValue('totalAmount', totalAmount, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Invoice Created', description: `Invoice ${state.data?.invoiceNumber} has been saved.` });
      form.reset();
      setSelectedPatient(null);
      initializeInvoiceNumber(); // Get next number
    }
    if (state?.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast, form]);
  
  const initializeInvoiceNumber = React.useCallback(async () => {
      const invNumber = await generateNextDocumentNumber('invoice');
      setValue('invoiceNumber', invNumber);
      setValue('id', invNumber);
  }, [setValue]);

   useEffect(() => {
    initializeInvoiceNumber();
  }, [initializeInvoiceNumber]);


  useEffect(() => {
    const db = getDatabase(app);
    const resultRef = ref(db, `sessions/${SESSION_ID}/result`);
    
    const unsubscribe = onValue(resultRef, (snapshot) => {
        const result = snapshot.val();
        if (result?.type === 'barcode' && result.data) {
            handleBarcodeScanned(result.data);
            set(resultRef, null); // Clear the result from DB
        }
    });

    return () => off(resultRef);

  }, [inventory]);


  const addItem = () => {
    append({
      id: `item-${fields.length}`,
      name: '',
      hsn: '3004',
      qty: 1,
      price: 0,
      discount: 0,
      tax: 18,
    } as InvoiceItem);
  };
  
  const handleSelectPatient = (patient: PatientData | 'new') => {
      if (patient !== 'new') {
          setSelectedPatient(patient);
          setValue('patientId', patient.id);
      } else {
          toast({title: "Feature not available", description: "Please select an existing patient."})
      }
  }

  const handleBarcodeScanned = async (barcode: string) => {
    const currentInventory = await getInventoryItems(); // Fetch latest inventory
    setInventory(currentInventory);

    const itemFound = currentInventory.find(item => item.itemCode === barcode);

    if (itemFound) {
      const existingItemIndex = getValues('items').findIndex(i => i.name === itemFound.name);
      
      if(existingItemIndex > -1) {
         setValue(`items.${existingItemIndex}.qty`, getValues(`items.${existingItemIndex}.qty`) + 1);
      } else {
        append({
            id: itemFound.id || `item-${fields.length}`,
            name: itemFound.name,
            hsn: itemFound.hsnCode || '3004',
            price: itemFound.salePrice || 0,
            qty: 1,
            discount: 0,
            tax: itemFound.gstPercentage || 18,
        });
      }
      toast({ title: "Item Added", description: `${itemFound.name} added to invoice.` });
    } else {
      setScannedBarcode(barcode);
      setIsNewItemFormOpen(true);
      toast({ title: "Item Not Found", description: `Item not in inventory. Please add new item details.`, variant: 'default' });
    }
  };
  
  const triggerMobileScan = () => {
    const db = getDatabase(app);
    const commandRef = ref(db, `sessions/${SESSION_ID}/command`);
    set(commandRef, { action: 'SCAN_BARCODE', timestamp: Date.now() });
    toast({ title: "Request Sent", description: "Check your mobile device to scan the barcode." });
  };
  
  const handleNewItemSubmit = (newItem: InventoryItem) => {
    append({
      id: `new-item-${fields.length}`,
      name: newItem.name,
      hsn: newItem.hsnCode || '3004',
      price: newItem.salePrice,
      qty: 1,
      discount: 0,
      tax: newItem.gstPercentage,
    });
    setInventory(prev => [...prev, newItem]);
    setIsNewItemFormOpen(false);
    setScannedBarcode(undefined);
  };


  const processSubmit = (data: Invoice) => {
    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(data));
    formAction(formData);
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(processSubmit)}>
          <CardHeader>
            <CardTitle>New Sales Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input {...register('invoiceNumber')} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <PatientSearchDropdown onSelectPatient={handleSelectPatient} selectedPatient={selectedPatient} />
                {form.formState.errors.patientId && <p className="text-destructive text-sm mt-1">{form.formState.errors.patientId.message}</p>}
              </div>
            </div>

            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Invoice Items</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={triggerMobileScan}>
                    <Barcode className="mr-2 h-4 w-4" />
                    Scan with Mobile
                  </Button>
                  <Button size="sm" type="button" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item Manually
                  </Button>
                </div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Item/Service</TableHead>
                      <TableHead>HSN/SAC</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Discount (%)</TableHead>
                      <TableHead>Tax (%)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center">No items added.</TableCell></TableRow>
                    ) : (
                      fields.map((field, index) => {
                        const itemTotal = (watchItems[index]?.qty || 0) * (watchItems[index]?.price || 0) * (1 - (watchItems[index]?.discount || 0) / 100);
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Input {...register(`items.${index}.name`)} placeholder="Item name" />
                            </TableCell>
                            <TableCell>
                              <Input {...register(`items.${index}.hsn`)} className="w-20" />
                            </TableCell>
                            <TableCell>
                              <Input {...register(`items.${index}.qty`)} type="number" min="1" className="w-16" />
                            </TableCell>
                            <TableCell>
                              <Input {...register(`items.${index}.price`)} type="number" className="w-24" />
                            </TableCell>
                            <TableCell>
                              <Input {...register(`items.${index}.discount`)} type="number" min="0" max="100" className="w-20" />
                            </TableCell>
                            <TableCell>
                              <Input {...register(`items.${index}.tax`)} type="number" className="w-16" />
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{itemTotal.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input {...register('notes')} placeholder="Add notes to invoice" />
                </div>
              </div>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal:</span><span>₹{form.getValues('subtotal')?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><Label>Discount on Total:</Label><Input {...register('discountOnTotal')} type="number" className="w-24 h-8" /></div>
                <div className="flex items-center justify-between"><Label>Additional Charges:</Label><Input {...register('additionalCharges')} type="number" className="w-24 h-8" /></div>
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>₹{form.getValues('totalAmount')?.toFixed(2)}</span></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset Form</Button>
            <div className="flex gap-2">
              <Button type="submit" disabled={state?.pending}>
                  {state?.pending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  Create Invoice
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <InventoryItemForm 
        open={isNewItemFormOpen}
        onClose={() => setIsNewItemFormOpen(false)}
        onFormSuccess={handleNewItemSubmit}
        initialData={{ itemCode: scannedBarcode } as InventoryItem}
      />
    </>
  );
};
