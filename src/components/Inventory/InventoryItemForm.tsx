

'use client';

import React, { useState, useEffect, useRef, useActionState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Package, AlertTriangle, Box, Ruler, Archive, Barcode, 
  Search, FileText, Calendar, DollarSign, Percent, SlidersHorizontal, Loader2, X, Upload, Image as ImageIcon, Sparkles, Plus, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import BarcodeScanner from '../ERP/BarcodeScanner';
import { inventoryItemSchema, InventoryItem } from '@/types/inventory';
import { createOrUpdateInventoryItem } from '@/actions/inventory.actions.ts';
import { Badge } from '../ui/badge';
import StockStatusBadge from '../Inventory/StockStatusBadge';
import { Autocomplete } from '../ui/autocomplete';
import { Card, CardContent } from '@/components/ui/card';


interface InventoryItemFormProps {
  open: boolean;
  onClose: () => void;
  onFormSuccess: (newItem: InventoryItem) => void;
  initialData?: InventoryItem | null;
  initialBarcode?: string;
  onSubmit?: (data: InventoryItem) => void;
}

function SubmitButton({ initialData }: { initialData?: InventoryItem | null }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
            {initialData && initialData.id ? 'Update Item' : 'Add Item'}
        </Button>
    )
}

const ayurvedicForms = [
    "Asava", "Arishta", "Kashaya", "Phanta", "Hima", 
    "Avaleha / Leha", "Vati", "Gulika", "Ghanavati", 
    "Churna", "Pishti", "Bhasma", "Rasa", "Parpati", 
    "Kupipakwa Rasayana", "Pottali Rasayana", 
    "Taila", "Ghrita", "Lepa", "Anjana", "Dhupana",
    "powder", "tablet", "capsule", "liquid", "oil", "other"
];

const formToUnitMap: { [key: string]: string } = {
  churna: 'g', powder: 'g', bhasma: 'g', pishti: 'g', lepa: 'g',
  arishta: 'ml', asava: 'ml', kashaya: 'ml', liquid: 'ml', syrup: 'ml', oil: 'ml', taila: 'ml', ghrita: 'ml',
  vati: 'units', gulika: 'units', ghanavati: 'units', capsule: 'units', tablet: 'units',
};

const unitToSizeTags: { [key: string]: string[] } = {
    'ml': ['50ml', '100ml', '200ml', '450ml', '1L'],
    'l': ['1L', '2L', '5L'],
    'g': ['50g', '100g', '250g', '500g', '1kg'],
    'kg': ['1kg', '5kg', '10kg', '25kg'],
    'units': ['30 tabs', '60 tabs', '120 tabs', '1000 tabs'],
};

const gstSlabs = [0, 5, 12, 18, 28];


const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ open, onClose, onFormSuccess, initialData, initialBarcode, onSubmit: onSubmitProp }) => {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createOrUpdateInventoryItem, null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<InventoryItem>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: initialData || {
      name: initialData?.name || '',
      imageUrl: '',
      itemClassification: 'classical',
      category: '',
      itemType: 'herb',
      serviceOrProduct: 'product',
      unit: 'units',
      packageSize: '',
      openingStock: 0,
      enableBatching: false,
      itemCode: initialBarcode || '',
      hsnCode: '3004',
      description: '',
      salePrice: 0,
      purchasePrice: 0,
      gstPercentage: 5,
      stock: 0,
      batchNo: '',
      expiryDate: new Date().toISOString().split('T')[0],
      lowStockThreshold: 10,
      supplierInfo: '',
      customFields: []
    },
  });

  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control: form.control,
    name: "customFields",
  });

  const itemName = form.watch('name');
  const medicineCategory = form.watch('category');
  const selectedUnit = form.watch('unit');
  const enableBatching = form.watch('enableBatching');

  useEffect(() => {
    const { getValues, setValue } = form;
    const currentCategory = getValues('category');
    
    if (itemName && !currentCategory) {
      const lowerCaseName = itemName.toLowerCase();
      const matchedForm = ayurvedicForms.find(formName =>
        lowerCaseName.includes(formName.toLowerCase().split(' / ')[0])
      );
      if (matchedForm) {
        setValue('category', matchedForm);
      }
    }
  }, [itemName, form]);
  
  useEffect(() => {
    const { getValues, setValue } = form;
    const currentCategory = getValues('category');
    const currentUnit = getValues('unit');

    if (currentCategory) {
      const formLowerCase = currentCategory.toLowerCase().split(' > ')[0].trim();
      const newUnit = formToUnitMap[formLowerCase];
      if (newUnit && currentUnit !== newUnit) {
        setValue('unit', newUnit);
      }
    }
  }, [medicineCategory, form]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({
          name: '',
          imageUrl: '',
          itemClassification: 'classical',
          category: '',
          itemType: 'herb',
          serviceOrProduct: 'product',
          unit: 'units',
          packageSize: '',
          openingStock: 0,
          enableBatching: false,
          itemCode: initialBarcode || '',
          hsnCode: '3004',
          description: '',
          salePrice: 0,
          purchasePrice: 0,
          gstPercentage: 5,
          stock: 0,
          batchNo: '',
          expiryDate: new Date().toISOString().split('T')[0],
          lowStockThreshold: 10,
          supplierInfo: '',
          customFields: []
        });
      }
    }
  }, [initialData, form, open, initialBarcode]);

  useEffect(() => {
    if (state?.success && state.data) {
      toast({
        title: initialData?.id ? "Item Updated" : "Item Added",
        description: `${state.data.name} has been saved.`,
      });
      onFormSuccess(state.data);
    }
    if (state?.error) {
      toast({
        title: "Failed to save item",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, onFormSuccess, initialData, form]);

  const handleBarcodeScanned = (result: string) => {
    form.setValue('itemCode', result);
    toast({ title: 'Barcode Scanned', description: `Item code set to: ${result}` });
    setIsScannerOpen(false);
  };
  
  const handleAIGenerate = () => {
    const productName = form.getValues('name');
    const category = form.getValues('category');
    
    if (!productName) {
      toast({
        title: "Product name required",
        description: "Please enter a product name first to generate description.",
        variant: "destructive",
      });
      return;
    }

    const aiGeneratedDescription = `${productName} is a high-quality ${category || 'product'} commonly used in Ayurvedic treatments. It offers numerous health benefits and is known for its effectiveness.`;
    
    form.setValue('description', aiGeneratedDescription);
    toast({
      title: "Description generated",
      description: "AI has generated a product description based on the provided name.",
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit((data) => {
        if (onSubmitProp) {
            const simulatedSavedItem = { ...data, id: `new-${Date.now()}` };
            onSubmitProp(simulatedSavedItem);
        } else {
            const finalData = { ...data, id: initialData?.id };
            const formData = new FormData();
            formData.append('jsonData', JSON.stringify(finalData));
            formAction(formData);
        }
    })(event)
  };

  const branchStock = [
    { name: 'Jayanagar (HO)', stock: 15, status: 'In Stock' },
    { name: 'Indiranagar', stock: 8, status: 'Low Stock' },
    { name: 'Koramangala', stock: 0, status: 'Out of Stock' },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle className="flex items-center text-ayurveda-green">
              <Package className="mr-2 h-5 w-5" />
              {initialData && initialData.id ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={handleFormSubmit} ref={formRef} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="basic">Basic Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing Details</TabsTrigger>
                    <TabsTrigger value="stock">Stock Information</TabsTrigger>
                    <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="mt-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-1 space-y-6">
                            <div className="space-y-2">
                                <Label>Product Image</Label>
                                <div className="aspect-square w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4">
                                   <img 
                                    src={form.watch('imageUrl') || 'https://placehold.co/300x300.png'} 
                                    alt="Product"
                                    data-ai-hint="product medicine"
                                    className="w-32 h-32 object-contain mb-4" />
                                    <Button type="button" variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload Image</Button>
                                </div>
                            </div>
                            {initialData && (
                                <div className="space-y-2">
                                    <Label>Branch-wise Stock</Label>
                                    <Card>
                                        <CardContent className="p-3 space-y-2">
                                            {branchStock.map(branch => (
                                                <div key={branch.name} className="flex justify-between items-center text-sm">
                                                    <span>{branch.name}</span>
                                                    <StockStatusBadge status={branch.status as any} />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2 space-y-4">
                           <FormField control={form.control} name="serviceOrProduct" render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="product" id="product" /></FormControl><Label htmlFor="product">Product</Label></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="service" id="service" /></FormControl><Label htmlFor="service">Service</Label></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Item Name*</FormLabel><FormControl><Input placeholder="e.g., Ashwagandha Powder" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center justify-between">
                                    <div className="flex items-center"><FileText className="mr-1 h-4 w-4" /> Description</div>
                                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={handleAIGenerate}><Sparkles className="mr-1 h-3 w-3" />AI Generate</Button>
                                  </FormLabel>
                                  <FormControl><Textarea placeholder="Enter product description, composition, or other details..." className="min-h-[100px]" {...field} /></FormControl><FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="itemCode" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center"><Barcode className="mr-1 h-4 w-4" /> Item Code (Barcode/ISBN)</FormLabel>
                                <div className="flex gap-2"><FormControl><Input placeholder="Scan or enter barcode..." {...field} /></FormControl><Button type="button" variant="outline" onClick={() => setIsScannerOpen(true)}>Scan</Button></div>
                                <FormDescription>Enter barcode, ISBN or any unique identifier for this product.</FormDescription><FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="unit" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="flex items-center"><Ruler className="mr-1 h-4 w-4" /> Measuring Unit*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="g">Grams (g)</SelectItem><SelectItem value="l">Liters (l)</SelectItem><SelectItem value="ml">Milliliters (ml)</SelectItem><SelectItem value="units">Units</SelectItem><SelectItem value="boxes">Boxes</SelectItem><SelectItem value="bottles">Bottles</SelectItem><SelectItem value="jars">Jars</SelectItem><SelectItem value="packets">Packets</SelectItem></SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="packageSize" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Package Size / Quantity</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 100ml, 60 tablets" {...field} />
                                        </FormControl>
                                        {selectedUnit && unitToSizeTags[selectedUnit] && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {unitToSizeTags[selectedUnit].map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                        onClick={() => form.setValue('packageSize', tag)}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="itemClassification" render={({ field }) => (
                                    <FormItem><FormLabel>Classification*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="classical">Classical</SelectItem><SelectItem value="proprietary">Proprietary</SelectItem></SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField
                                  control={form.control}
                                  name="category"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Category</FormLabel>
                                      <Autocomplete
                                          options={ayurvedicForms}
                                          value={field.value || ''}
                                          onValueChange={field.onChange}
                                          onCreateNew={(newValue) => field.onChange(newValue)}
                                          placeholder="e.g., Kashayam"
                                      />
                                      <FormDescription className="text-xs">
                                        Use `>` for subcategories (e.g., Churna > Sitopaladi).
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="itemType" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="flex items-center"><Box className="mr-1 h-4 w-4" /> Item Type*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an item type" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="raw">Raw Material</SelectItem><SelectItem value="finished">Finished Product</SelectItem><SelectItem value="herb">Herb</SelectItem><SelectItem value="compound">Compound</SelectItem><SelectItem value="service">Service</SelectItem></SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="openingStock" render={({ field }) => ( <FormItem><FormLabel>Opening Stock*</FormLabel><FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                             </div>
                        </div>
                     </div>
                  </TabsContent>
                   <TabsContent value="pricing" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                       <FormField control={form.control} name="salePrice" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="mr-1 h-4 w-4" /> Sale Price (₹)*</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="mr-1 h-4 w-4" /> Purchase Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField 
                            control={form.control} 
                            name="gstPercentage" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Percent className="mr-1 h-4 w-4" /> GST (%)*</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select GST slab" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {gstSlabs.map(slab => (
                                                <SelectItem key={slab} value={String(slab)}>{slab}%</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormDescription>The price at which you sell this item to customers, purchase price from suppliers and applicable GST.</FormDescription>
                    
                    <div className="p-4 bg-ayurveda-green/5 rounded-md mt-4">
                      <h3 className="font-medium mb-2">Price Calculations</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-sm text-muted-foreground">Net Profit:</p><p className="font-medium">₹{(form.watch('salePrice') - (form.watch('purchasePrice') || 0)).toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Margin:</p><p className="font-medium">{form.watch('purchasePrice') > 0 ? (((form.watch('salePrice') || 0) - (form.watch('purchasePrice') || 0)) / (form.watch('purchasePrice') || 1) * 100).toFixed(2) : "0.00"}%</p></div>
                        <div><p className="text-sm text-muted-foreground">Sale Price with GST:</p><p className="font-medium">₹{((form.watch('salePrice') || 0) * (1 + (form.watch('gstPercentage') || 0) / 100)).toFixed(2)}</p></div>
                        <div><p className="text-sm text-muted-foreground">GST Amount:</p><p className="font-medium">₹{((form.watch('salePrice') || 0) * ((form.watch('gstPercentage') || 0) / 100)).toFixed(2)}</p></div>
                      </div>
                    </div>
                  </TabsContent>

                   <TabsContent value="stock" className="mt-4">
                     <div className="space-y-4">
                         <FormField control={form.control} name="enableBatching" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Enable Batching & Expiry Tracking</FormLabel>
                                    <FormDescription>Allow stock management batch-wise for this medicine.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />

                        {enableBatching && (
                          <div className="space-y-4 pt-4 border-t">
                            <FormField control={form.control} name="hsnCode" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center justify-between">
                                    <div className="flex items-center"><Barcode className="mr-1 h-4 w-4" /> HSN Code</div>
                                    <a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank" rel="noopener noreferrer" className="text-sm text-ayurveda-green hover:underline flex items-center"><Search className="mr-1 h-3 w-3" />Find HSN</a>
                                  </FormLabel>
                                  <FormControl><Input placeholder="Default: 3004 (Medicaments)" {...field} /></FormControl><FormDescription>Default is 3004 for Ayurvedic medicaments. Change if needed.</FormDescription><FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="supplierInfo" render={({ field }) => (<FormItem><FormLabel>Supplier Information</FormLabel><FormControl><Textarea placeholder="Enter supplier details, contact information..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="space-y-4 border-t pt-4">
                                <FormField control={form.control} name="batchNo" render={({ field }) => (<FormItem><FormLabel>Batch Number*</FormLabel><FormControl><Input placeholder="e.g., BAT2025-01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>Expiry Date*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="stock" render={({ field }) => (<FormItem><FormLabel>Batch Quantity*</FormLabel><FormControl><Input type="number" min="0" step="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Alert Threshold*</FormLabel><FormControl><Input type="number" min="1" step="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormDescription className="flex items-center"><AlertTriangle className="w-3 h-3 text-ayurveda-terracotta mr-1" /> Alert when stock falls below this number</FormDescription><FormMessage /></FormItem>)} />
                            </div>
                          </div>
                        )}
                     </div>
                  </TabsContent>
                  
                  <TabsContent value="custom" className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />Custom Fields</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendCustomField({ name: "", value: "" })}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Field
                      </Button>
                    </div>
                     <div className="space-y-4">
                      {customFields.length > 0 ? (
                        customFields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-2">
                            <FormField
                              control={form.control}
                              name={`customFields.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-grow">
                                  <FormLabel>Field Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., Dhatu" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`customFields.${index}.value`}
                              render={({ field }) => (
                                <FormItem className="flex-grow">
                                  <FormLabel>Field Value</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., Rakta" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeCustomField(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No custom fields added.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <div className="flex gap-2">
                    {activeTab !== "basic" && (<Button type="button" variant="secondary" onClick={() => { const tabOrder = ["basic", "pricing", "stock", "custom"]; const currentIndex = tabOrder.indexOf(activeTab); if (currentIndex > 0) { setActiveTab(tabOrder[currentIndex - 1]); }}} >Previous</Button>)}
                    {activeTab !== "custom" ? (<Button type="button" onClick={() => { const tabOrder = ["basic", "pricing", "stock", "custom"]; const currentIndex = tabOrder.indexOf(activeTab); if (currentIndex < tabOrder.length - 1) { setActiveTab(tabOrder[currentIndex + 1]); }}}>Next</Button>) : <SubmitButton initialData={initialData} />}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScanned} />
    </>
  );
};

export default InventoryItemForm;
