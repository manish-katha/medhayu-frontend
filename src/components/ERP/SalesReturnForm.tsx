
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Search, Save, Loader2 } from 'lucide-react';
import { salesReturnSchema, SalesReturn } from '@/types/erp';
import { createSalesReturn, getInvoiceForReturn, generateNextDocumentNumber } from '@/actions/erp.actions';
import { useToast } from '@/hooks/use-toast';
import { getPatient } from '@/services/patient.service';
import { getInvoices } from '@/services/erp.service';


interface FoundInvoiceItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

const SalesReturnForm = () => {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createSalesReturn, null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundInvoice, setFoundInvoice] = useState<{ patientId: number; patientName: string; items: FoundInvoiceItem[] } | null>(null);

  const form = useForm<SalesReturn>({
    resolver: zodResolver(salesReturnSchema),
    defaultValues: {
      returnDate: new Date(),
      items: [],
      refundMethod: 'cash',
    },
  });

  const { control, register, handleSubmit, watch, setValue, reset } = form;

  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  });
  
  const watchItems = watch("items");

  const initializeReturnNumber = async () => {
    const returnNumber = await generateNextDocumentNumber('return');
    setValue('id', returnNumber);
  };

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Sales Return Created', description: `Return for invoice ${state.data?.invoiceId} has been processed.` });
      reset();
      setFoundInvoice(null);
      setInvoiceNumber('');
      initializeReturnNumber();
    }
    if (state?.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast, reset]);
  
  useEffect(() => {
    initializeReturnNumber();
  }, [setValue]);

  const handleSearchInvoice = async () => {
    if (!invoiceNumber) return;
    setIsSearching(true);
    
    const invoices = await getInvoices();
    const foundInvoiceData = invoices.find(inv => inv.invoiceNumber === invoiceNumber);

    if (foundInvoiceData) {
        const patient = await getPatient(foundInvoiceData.patientId);
        if (patient) {
            setFoundInvoice({ 
                patientId: foundInvoiceData.patientId, 
                patientName: patient.name, 
                items: foundInvoiceData.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    unit: 'pcs', // Assuming a unit, you may need to store this on the invoice
                    price: item.price,
                }))
            });

            setValue('invoiceId', invoiceNumber);
            setValue('patientId', foundInvoiceData.patientId);
            replace(foundInvoiceData.items.map(item => ({...item, returnQty: 0, reason: ''})));
        } else {
             toast({ title: 'Patient Not Found', description: `Could not find patient for invoice ${invoiceNumber}`, variant: 'destructive' });
             setFoundInvoice(null);
             replace([]);
        }
    } else {
        toast({ title: 'Invoice Not Found', description: `Could not find invoice with number ${invoiceNumber}`, variant: 'destructive' });
        setFoundInvoice(null);
        replace([]);
    }
    setIsSearching(false);
  };
  
  const calculateTotalRefund = () => {
    return watchItems.reduce((sum, item) => sum + (item.returnQty * item.price), 0);
  };

  const processSubmit = (data: SalesReturn) => {
    const dataToSubmit = {
        ...data,
        items: data.items.filter(item => item.returnQty > 0)
    };
    if(dataToSubmit.items.length === 0) {
        toast({title: "No items to return", description: "Please enter a return quantity for at least one item.", variant: "destructive"});
        return;
    }
    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(dataToSubmit));
    formAction(formData);
  }

  return (
    <Card className="mb-8">
    <form onSubmit={handleSubmit(processSubmit)}>
      <CardHeader><CardTitle>Sales Return</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Return Date</Label>
            <Controller name="returnDate" control={control} render={({field}) => (
                <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
            )} />
          </div>
          <div className="space-y-2">
            <Label>Original Invoice Number</Label>
            <div className="flex space-x-2">
                <Input placeholder="Enter invoice number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                <Button type="button" onClick={handleSearchInvoice} disabled={isSearching}>
                    {isSearching ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>
            {foundInvoice && <p className="text-sm text-green-600">Invoice found for: {foundInvoice.patientName}</p>}
          </div>
        </div>

        {foundInvoice && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Return Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b"><th className="p-2 pl-0">Item</th><th className="p-2">Original Qty</th><th className="p-2">Return Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Total</th><th className="p-2">Reason</th></tr>
                  </thead>
                  <tbody>
                    {fields.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 pl-0">{watchItems[index].name}</td>
                        <td className="p-2 text-center">{watchItems[index].qty}</td>
                        <td className="p-2"><Input {...register(`items.${index}.returnQty`)} type="number" min="0" max={watchItems[index].qty} className="w-20 mx-auto" /></td>
                        <td className="p-2 text-right">₹{watchItems[index].price.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium">₹{(watchItems[index].returnQty * watchItems[index].price).toFixed(2)}</td>
                        <td className="p-2">
                          <Controller name={`items.${index}.reason`} control={control} render={({field}) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={watchItems[index].returnQty <= 0}>
                              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                              <SelectContent><SelectItem value="defective">Defective</SelectItem><SelectItem value="wrong-item">Wrong Item</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                            </Select>
                          )} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end"><div className="w-full md:w-64 font-bold"><span>Total Refund: </span><span>₹{calculateTotalRefund().toFixed(2)}</span></div></div>
            <Separator />
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Refund Method</Label>
                    <Controller name="refundMethod" control={control} render={({field}) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select refund method" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem><SelectItem value="bank-transfer">Bank Transfer</SelectItem><SelectItem value="credit-note">Credit Note</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea {...register('notes')} placeholder="Add any additional notes..." /></div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => { reset(); setFoundInvoice(null); setInvoiceNumber(''); }}>Cancel</Button>
              <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={state?.pending || calculateTotalRefund() <= 0}>
                {state?.pending ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Process Return
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </form>
    </Card>
  );
};

export default SalesReturnForm;
