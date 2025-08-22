
'use client';

import React, { useActionState, useEffect, useState } from 'react';
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
import { CalendarIcon, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { purchaseOrderSchema, PurchaseOrder } from '@/types/erp';
import { createPurchaseOrder, generateNextDocumentNumber } from '@/actions/erp.actions';
import { useToast } from '@/hooks/use-toast';
import { Autocomplete } from '@/components/ui/autocomplete';
import { getInventoryItems } from '@/services/inventory.service';
import { InventoryItem } from '@/types/inventory';
import { getVendors } from '@/services/vendor.service';
import { Vendor } from '@/types/vendor';

interface PurchaseOrderFormProps {
    onFormSuccess: () => void;
}

const PurchaseOrderForm = ({ onFormSuccess }: PurchaseOrderFormProps) => {
    const { toast } = useToast();
    const [state, formAction] = useActionState(createPurchaseOrder, null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    
    const form = useForm<PurchaseOrder>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            date: new Date(),
            expectedDate: new Date(),
            items: [{
                id: 'item-0',
                itemName: '',
                itemDescription: '',
                quantity: 1,
                unit: 'kg',
                rate: 0,
                gst: 18,
            }],
            status: 'Draft',
        },
    });

    const { control, register, handleSubmit, watch, setValue } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        const fetchData = async () => {
            const [inventoryItems, vendorList] = await Promise.all([
                getInventoryItems(),
                getVendors()
            ]);
            setInventory(inventoryItems);
            setVendors(vendorList);
        };
        fetchData();
    }, []);

    const initializePoNumber = React.useCallback(async () => {
      const poNumber = await generateNextDocumentNumber('po');
      setValue('poNumber', poNumber);
      setValue('id', poNumber);
    }, [setValue]);

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Purchase Order Created', description: `PO ${state.data?.poNumber} has been saved.` });
            onFormSuccess();
        }
        if (state?.error) {
            toast({ title: 'Error', description: state.error, variant: 'destructive' });
        }
    }, [state, toast, onFormSuccess]);

    useEffect(() => {
        initializePoNumber();
    }, [initializePoNumber]);

    const handleItemSelect = (itemName: string, index: number) => {
        const selectedItem = inventory.find(item => item.name === itemName);
        if (selectedItem) {
            setValue(`items.${index}.itemName`, selectedItem.name);
            setValue(`items.${index}.itemDescription`, selectedItem.description || '');
            setValue(`items.${index}.rate`, selectedItem.purchasePrice || 0);
            setValue(`items.${index}.unit`, selectedItem.unit || 'units');
            setValue(`items.${index}.gst`, selectedItem.gstPercentage || 18);
        }
    }

    const calculateTotal = () => {
        const items = watch('items');
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const gst = items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gst || 0) / 100), 0);
        return subtotal + gst;
    };
    
    const onFormSubmit = (data: PurchaseOrder) => {
        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(data));
        formAction(formData);
    }

  return (
    <Card className="mb-8 border-none shadow-none">
    <form action={formAction} onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onFormSubmit)(e); }}>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Controller
              name="vendorId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="vendor"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id!}>{vendor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.vendorId && <p className="text-destructive text-sm mt-1">{form.formState.errors.vendorId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Purchase Order Date</Label>
            <Controller name="date" control={control} render={({ field }) => (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Purchase Order No.</Label>
            <Input {...register('poNumber')} readOnly className="bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label>Branch</Label>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Branch</SelectItem>
                        <SelectItem value="branch-1">Branch 1</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.branchId && <p className="text-destructive text-sm mt-1">{form.formState.errors.branchId.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <Controller name="expectedDate" control={control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                )} />
            </div>
            <div className="space-y-2">
                <Label>Reference</Label>
                <Input {...register('reference')} placeholder="Enter reference" />
            </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Items</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-12 md:col-span-3">
                <Label className="sr-only">Item</Label>
                <Controller
                    control={control}
                    name={`items.${index}.itemName`}
                    render={({ field }) => (
                       <Autocomplete
                          options={inventory.map(i => i.name)}
                          value={field.value}
                          onValueChange={field.onChange}
                          onSelect={(value) => handleItemSelect(value, index)}
                          placeholder="Item name"
                        />
                    )}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <Label className="sr-only">Description</Label>
                <Input {...register(`items.${index}.itemDescription`)} placeholder="Description" />
              </div>
              <div className="col-span-3 md:col-span-1"><Input {...register(`items.${index}.quantity`)} type="number" placeholder="Qty" /></div>
              <div className="col-span-3 md:col-span-1">
                 <Controller
                    name={`items.${index}.unit`}
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kg">kg</SelectItem><SelectItem value="g">g</SelectItem><SelectItem value="pcs">pcs</SelectItem><SelectItem value="box">box</SelectItem><SelectItem value="units">units</SelectItem><SelectItem value="bottles">bottles</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                  />
              </div>
              <div className="col-span-3 md:col-span-1"><Input {...register(`items.${index}.rate`)} type="number" placeholder="Rate" /></div>
              <div className="col-span-2 md:col-span-1"><Input {...register(`items.${index}.gst`)} type="number" placeholder="GST %" /></div>
              <div className="col-span-2 md:col-span-1 font-medium text-right">₹{((watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.rate`) || 0)).toFixed(2)}</div>
              <div className="col-span-1"><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `item-${fields.length}`, itemName: '', itemDescription: '', quantity: 1, unit: 'kg', rate: 0, gst: 18 })}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>
        
        <div className="flex justify-end"><div className="w-full md:w-64 font-bold"><span>Total: </span><span>₹{calculateTotal().toFixed(2)}</span></div></div>
        <Separator />
        <div className="space-y-4">
          <div className="space-y-2"><Label>Notes</Label><Textarea {...register('notes')} placeholder="Add any additional notes..." /></div>
          <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea {...register('terms')} defaultValue="1. Payment due within 30 days of delivery." /></div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Save as Draft</Button>
          <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={state?.pending}>
             {state?.pending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            Create Purchase Order
          </Button>
        </div>
      </CardContent>
      </form>
    </Card>
  );
};

export default PurchaseOrderForm;
