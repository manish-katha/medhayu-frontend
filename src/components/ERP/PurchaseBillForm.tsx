

'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Save, Loader2, ChevronsUpDown, Building, Check, Mail, Phone, AlertCircle, Plus, Trash2, UserPlus, Package } from 'lucide-react';
import { purchaseBillSchema, PurchaseBill, PurchaseOrder } from '@/types/erp';
import { createPurchaseBill, getPurchaseOrderForBill } from '@/actions/erp.actions';
import { getPurchaseOrders } from '@/services/erp.service';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Vendor } from '@/types/vendor';
import { getVendors, addVendor } from '@/services/vendor.service';
import type { ExtractedBillData } from '@/ai/flows/extract-purchase-bill-data';
import { Badge } from '../ui/badge';
import { Autocomplete } from '../ui/autocomplete';
import VendorForm from './Vendor/VendorForm';
import { InventoryItem } from '@/types/inventory';
import { getInventoryItems } from '@/services/inventory.service';
import InventoryItemForm from '../Inventory/InventoryItemForm';


interface PurchaseBillFormProps {
    onFormSuccess: () => void;
    initialData?: ExtractedBillData | null;
}

const PurchaseBillForm = ({ onFormSuccess, initialData }: PurchaseBillFormProps) => {
    const { toast } = useToast();
    const [state, formAction] = useActionState(createPurchaseBill, null);
    const [selectedPoNumber, setSelectedPoNumber] = useState('');
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isPoPopoverOpen, setIsPoPopoverOpen] = useState(false);
    const [isVendorPopoverOpen, setIsVendorPopoverOpen] = useState(false);
    const [isNewVendorFormOpen, setIsNewVendorFormOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
    const [newItemForIndex, setNewItemForIndex] = useState<number | null>(null);
    const [newItemInitialName, setNewItemInitialName] = useState<string>('');

    const form = useForm<PurchaseBill>({
        resolver: zodResolver(purchaseBillSchema),
        defaultValues: {
            billDate: new Date(),
            items: [],
        },
    });

    const { control, register, handleSubmit, watch, setValue, reset, trigger } = form;

    const { fields, replace, append, remove, update } = useFieldArray({
        control,
        name: "items",
    });

     useEffect(() => {
        if (initialData) {
            setValue('billNumber', initialData.billNumber || '');
            if (initialData.billDate) {
                try {
                    setValue('billDate', new Date(initialData.billDate));
                } catch(e) {
                    setValue('billDate', new Date());
                }
            }
            if (initialData.vendorName) {
                setValue('vendorName', initialData.vendorName);
                const existingVendor = vendors.find(v => v.name.toLowerCase() === initialData.vendorName?.toLowerCase());
                if (existingVendor) {
                    setSelectedVendor(existingVendor);
                    setValue('vendorId', existingVendor.id);
                } else {
                     setSelectedVendor({ 
                        name: initialData.vendorName,
                        address: initialData.vendorAddress,
                        gstin: initialData.vendorGstin
                     } as Vendor);
                }
            }
            if (initialData.items) {
                 replace(initialData.items.map(item => ({
                    id: `item-${Math.random()}`,
                    itemName: item.itemName,
                    itemDescription: '',
                    quantity: item.quantity,
                    receivedQty: item.quantity,
                    unit: 'units',
                    rate: item.rate,
                    gst: 18,
                 })));
            }
        }
    }, [initialData, setValue, vendors, replace]);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsSearching(true);
            const [pos, vends, inventory] = await Promise.all([
                getPurchaseOrders(),
                getVendors(),
                getInventoryItems(),
            ]);
            setPurchaseOrders(pos);
            setVendors(vends);
            setInventoryItems(inventory);
            setIsSearching(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Purchase Bill Created', description: `Bill has been saved.` });
            onFormSuccess();
        }
        if (state?.error) {
            toast({ title: 'Error', description: state.error, variant: 'destructive' });
        }
    }, [state, toast, onFormSuccess]);
    
    const handleSelectPO = async (poNumber: string) => {
        setSelectedPoNumber(poNumber);
        setIsPoPopoverOpen(false);
        setValue('purchaseOrderId', poNumber);

        if (!poNumber) {
            setSelectedVendor(null);
            setValue('vendorId', undefined);
            setValue('vendorName', undefined);
            replace([]);
            return;
        };

        setIsSearching(true);
        const result = await getPurchaseOrderForBill(poNumber);
        if (result.success && result.purchaseOrder) {
            const po = result.purchaseOrder;
            const vendor = vendors.find(v => v.id === po.vendorId);
            handleSelectVendor(vendor);
            replace(po.items.map(item => ({...item, receivedQty: item.quantity})));
            toast({ title: 'Purchase Order Found', description: `Loaded items from PO ${po.poNumber}.` });
        } else {
            toast({ title: 'Not Found', description: result.error, variant: 'destructive' });
            setSelectedVendor(null);
        }
        setIsSearching(false);
    }

    const handleSelectVendor = (vendor: Vendor | null) => {
      setSelectedVendor(vendor);
      setIsVendorPopoverOpen(false);
      if (vendor) {
        setValue('vendorId', vendor.id);
        setValue('vendorName', vendor.name);
      } else {
        setValue('vendorId', undefined);
      }
      trigger('vendorId');
    };
    
    const handleNewVendorSuccess = (newVendor: Vendor) => {
        setVendors(prev => [...prev, newVendor]);
        handleSelectVendor(newVendor);
        setIsNewVendorFormOpen(false);
    }

    const handleItemSelect = (itemName: string, index: number) => {
        const selectedItem = inventoryItems.find(item => item.name === itemName);
        if (selectedItem) {
            update(index, {
                ...fields[index],
                itemName: selectedItem.name,
                itemDescription: selectedItem.description || '',
                rate: selectedItem.purchasePrice || 0,
                unit: selectedItem.unit || 'units',
                gst: selectedItem.gstPercentage || 18,
            });
        }
    };
    
    const handleNewItemClick = (index: number) => {
        const currentItemName = form.getValues(`items.${index}.itemName`);
        setNewItemInitialName(currentItemName);
        setNewItemForIndex(index);
        setIsNewItemFormOpen(true);
    };
    
    const handleNewItemSubmit = (newItem: InventoryItem) => {
        if (newItemForIndex !== null) {
            setInventoryItems(prev => [...prev, newItem]); // Update local inventory state
            update(newItemForIndex, {
                ...fields[newItemForIndex],
                itemName: newItem.name,
                itemDescription: newItem.description || '',
                rate: newItem.purchasePrice,
                unit: newItem.unit,
                gst: newItem.gstPercentage,
            });
            setIsNewItemFormOpen(false);
            setNewItemForIndex(null);
            setNewItemInitialName('');
            toast({ title: 'New Item Created', description: `${newItem.name} added to inventory and bill.` });
        }
    };

    
    const processSubmit = (data: PurchaseBill) => {
        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(data));
        formAction(formData);
    }
    
    const calculatedTotal = watch('items').reduce((acc, item) => acc + (item.receivedQty || 0) * (item.rate || 0), 0);
    const watchVendorId = watch('vendorId');
    const watchPoId = watch('purchaseOrderId');

  return (
    <>
    <Card className="mb-8 border-none shadow-none">
    <form onSubmit={handleSubmit(processSubmit)}>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Link to Purchase Order</Label>
             <Popover open={isPoPopoverOpen} onOpenChange={setIsPoPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isPoPopoverOpen}
                        className="w-full justify-between"
                        disabled={isSearching}
                    >
                        {selectedPoNumber || "Select PO (Optional)..."}
                        {isSearching ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search PO number..." />
                        <CommandList>
                            <CommandEmpty>No purchase order found.</CommandEmpty>
                            <CommandGroup>
                                {purchaseOrders.map((po) => (
                                    <CommandItem
                                        key={po.id}
                                        value={po.poNumber}
                                        onSelect={(currentValue) => handleSelectPO(currentValue === selectedPoNumber ? "" : currentValue)}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", selectedPoNumber === po.poNumber ? "opacity-100" : "opacity-0")} />
                                        {po.poNumber}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Supplier Bill No.*</Label>
            <Input {...register('billNumber')} placeholder="Enter supplier's bill number" />
            {form.formState.errors.billNumber && <p className="text-destructive text-sm mt-1">{form.formState.errors.billNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Bill Date*</Label>
            <Controller name="billDate" control={control} render={({ field }) => (
                <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
            )} />
          </div>
        </div>

        {selectedVendor ? (
            <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-medium text-sm flex items-center gap-2 mb-2"><Building size={16}/> Vendor Details</h4>
                        <p className="text-sm font-semibold">{selectedVendor.name}</p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                           {selectedVendor.address && <p>{selectedVendor.address}</p>}
                           {selectedVendor.phone && <p className='flex items-center gap-1.5'><Phone size={10}/> {selectedVendor.phone}</p>}
                           {selectedVendor.email && <p className='flex items-center gap-1.5'><Mail size={10}/> {selectedVendor.email}</p>}
                           {selectedVendor.gstin && <p>GSTIN: {selectedVendor.gstin}</p>}
                        </div>
                    </div>
                     {!selectedVendor.id && (
                        <Badge variant="warning">New Vendor</Badge>
                    )}
                </div>
            </div>
        ) : !watchPoId && (
            <div>
              <Label>Vendor*</Label>
               <Popover open={isVendorPopoverOpen} onOpenChange={setIsVendorPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                        {watch('vendorName') || "Select or type new vendor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search or type vendor name..." onValueChange={(val) => setValue('vendorName', val)} />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => {setIsVendorPopoverOpen(false); setIsNewVendorFormOpen(true);}}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Create a new vendor
                            </CommandItem>
                            {vendors.map((vendor) => (
                                <CommandItem key={vendor.id} value={vendor.name} onSelect={() => handleSelectVendor(vendor)}>
                                    <Check className={cn("mr-2 h-4 w-4", watchVendorId === vendor.id ? "opacity-100" : "opacity-0")} />
                                    {vendor.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {form.formState.errors.vendorName && <p className="text-destructive text-sm mt-1">{form.formState.errors.vendorName.message}</p>}
            </div>
        )}

        <Separator />
        <div className="space-y-4">
          <h3 className="font-medium">Received Items</h3>
           {fields.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b"><th className="p-2 pl-0 text-left w-2/5">Item</th><th className="p-2 text-center">Ordered Qty</th><th className="p-2 text-center">Received Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Total</th><th className="p-2"></th></tr></thead>
                <tbody>
                  {fields.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 pl-0">
                        {watchPoId ? (
                             watch(`items.${index}.itemName`)
                        ) : (
                           <Controller
                                name={`items.${index}.itemName`}
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={inventoryItems.map(i => i.name)}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        onSelect={(value) => handleItemSelect(value, index)}
                                        onCreateNew={() => handleNewItemClick(index)}
                                        placeholder="Type or select item"
                                    />
                                )}
                            />
                        )}
                      </td>
                      <td className="p-2 text-center">{watch(`items.${index}.quantity`)}</td>
                      <td className="p-2"><Input {...register(`items.${index}.receivedQty`, { valueAsNumber: true })} type="number" min="0" max={watchPoId ? watch(`items.${index}.quantity`) : undefined} className="w-24 mx-auto" /></td>
                      <td className="p-2 text-right">
                        {watchPoId ? (
                            `₹${watch(`items.${index}.rate`, 0).toFixed(2)}`
                        ) : (
                            <Input {...register(`items.${index}.rate`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="w-28 text-right" />
                        )}
                      </td>
                      <td className="p-2 text-right font-medium">₹{(watch(`items.${index}.receivedQty`, 0) * watch(`items.${index}.rate`, 0)).toFixed(2)}</td>
                      <td className="p-2"><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!watchPoId && (
            <Button type="button" variant="outline" size="sm" onClick={() => append({id: `item-${fields.length}`, itemName: '', itemDescription: '', quantity: 1, receivedQty: 1, unit: 'units', rate: 0, gst: 18})}>
              <Plus className="mr-2 h-4 w-4" /> Add Item Manually
            </Button>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-end items-start gap-6">
            <div className="space-y-2 flex-grow"><Label>Notes</Label><Textarea {...register('notes')} placeholder="Add any notes about the delivery or bill..." /></div>
            
            <div className="p-4 border rounded-md w-80 space-y-2 bg-muted/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Calculated Total:</span>
                    <span className="font-medium">₹{calculatedTotal.toFixed(2)}</span>
                </div>
                {initialData?.totalAmount && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">AI Parsed Total:</span>
                        <span className="font-medium">₹{initialData.totalAmount.toFixed(2)}</span>
                    </div>
                )}
                 {initialData?.totalAmount && Math.abs(calculatedTotal - initialData.totalAmount) > 1 && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-red-50 p-2 rounded-md">
                        <AlertCircle size={14} />
                        <span>Warning: Totals do not match. Please verify.</span>
                    </div>
                 )}
            </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => { reset(); setSelectedPoNumber(''); setSelectedVendor(null); }}>Cancel</Button>
          <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Save Purchase Bill
          </Button>
        </div>
      </CardContent>
    </form>
    </Card>
    <VendorForm
        open={isNewVendorFormOpen}
        onOpenChange={setIsNewVendorFormOpen}
        onFormSuccess={handleNewVendorSuccess}
    />
     <InventoryItemForm
        open={isNewItemFormOpen}
        onClose={() => setIsNewItemFormOpen(false)}
        onSubmit={handleNewItemSubmit}
        onFormSuccess={() => {}} // Can be empty as onSubmit is used
        initialData={{ name: newItemInitialName } as InventoryItem}
      />
    </>
  );
};

export default PurchaseBillForm;
