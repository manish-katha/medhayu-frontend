
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Users, Building, Replace, Wallet, ChevronsUpDown, Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { createPurchaseOrdersFromCart } from '@/actions/erp.actions';
import { Product, VendorInfo } from '@/types/product';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import DynamicPriceCard from './DynamicPriceCard';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import { Checkbox } from '../ui/checkbox';
import { Autocomplete, ComboboxOption } from '../ui/autocomplete';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { getClinics } from '@/services/clinic.service'; // Import clinic service
import type { Clinic } from '@/types';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  quantity: number;
  purchaseOption?: 'mrp' | 'discounted';
  vendorId: string;
  availableVendors: VendorInfo[];
  clinicId: string; // New field for clinic
}

interface VendorAssignmentDropdownProps {
  selectedItemIds: number[];
  onAssign: (vendorId: string) => void;
  allVendors: VendorInfo[];
}

const VendorAssignmentDropdown: React.FC<VendorAssignmentDropdownProps> = ({ selectedItemIds, onAssign, allVendors }) => {
  const [value, setValue] = React.useState("");

  const handleSelect = (vendorId: string) => {
    if (!vendorId) return;
    onAssign(vendorId);
  };

  const vendorOptions: ComboboxOption[] = allVendors.map(v => ({ value: v.id, label: `${v.name}` }));

  return (
    <Autocomplete
      options={vendorOptions}
      value={value}
      onValueChange={setValue}
      onSelect={handleSelect}
      placeholder={`Assign Vendor (${selectedItemIds.length} selected)`}
      className="w-full"
    />
  );
};

const ClinicAssignmentDropdown = ({
  selectedItemIds,
  onAssign,
  allClinics
}: {
  selectedItemIds: number[];
  onAssign: (clinicId: string) => void;
  allClinics: Clinic[];
}) => {
    const [value, setValue] = React.useState("");

    const handleSelect = (clinicId: string) => {
        if (!clinicId) return;
        onAssign(clinicId);
    }
    
    const clinicOptions: ComboboxOption[] = allClinics.map(c => ({ value: c.clinicId, label: c.clinicName }));

    return (
         <Autocomplete
            options={clinicOptions}
            value={value}
            onValueChange={setValue}
            onSelect={handleSelect}
            placeholder={`Assign Clinic (${selectedItemIds.length} selected)`}
            className="w-full"
        />
    );
};


interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const CartDialog: React.FC<CartDialogProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  const { toast } = useToast();
  const { cartItems, addToCart, updateQuantity, removeItem, updateVendorForSelectedItems, updateClinicForSelectedItems, clearCart } = useCart();
  const [quantity, setQuantity] = useState(5);
  const [purchaseOption, setPurchaseOption] = useState<'mrp' | 'discounted'>('discounted');
  const router = useRouter();
  const [useWallet, setUseWallet] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [allClinics, setAllClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    getClinics().then(setAllClinics);
  }, []);

  const walletBalance = 5300; // Mock balance

  const handleConfirmAddToCart = () => {
    if (!product) return;
    const priceToPay = (purchaseOption === 'mrp' && product.mrp) ? product.mrp : product.price;
    const defaultVendor = product.vendors?.[0] || { id: 'vendor-1', name: 'Herbal Suppliers Ltd.' };
    const defaultClinic = allClinics[0] || { clinicId: 'clinic-001', clinicName: 'Oshadham Ayurveda - Jayanagar (HO)'};
    
    addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: Number(priceToPay) || 0,
        mrp: product.mrp,
        quantity: Number(quantity) || 5,
        purchaseOption: purchaseOption,
        vendorId: defaultVendor.id,
        availableVendors: product.vendors || [],
        clinicId: defaultClinic.clinicId, // Default clinic
    });
    onOpenChange(false);
  };
  
  const handleCreatePO = async () => {
    if (!cartItems || cartItems.length === 0) return;
    const itemsForPO = cartItems.filter(item => selectedItems.includes(item.id));
    if (itemsForPO.length === 0) {
        toast({
            title: "No items selected",
            description: "Please select items to create a purchase order.",
            variant: "destructive",
        });
        return;
    }
    const result = await createPurchaseOrdersFromCart(itemsForPO);
    if(result.success && result.poCount > 0) {
      toast({
        title: "Purchase Orders Created",
        description: `${result.poCount} purchase order(s) have been successfully created.`,
      });
      clearCart();
      onOpenChange(false);
      router.push('/erp/purchases');
    } else {
      toast({
        title: "Failed to create PO",
        description: result.error,
        variant: "destructive"
      })
    }
  }

  const allAvailableVendors = React.useMemo(() => {
    if (!cartItems) return [];
    const vendors = new Map<string, VendorInfo>();
    cartItems.forEach(item => {
        (item.availableVendors || []).forEach(v => {
            if (!vendors.has(v.id)) {
                vendors.set(v.id, v);
            }
        });
    });
    return Array.from(vendors.values());
  }, [cartItems]);
  
  const groupedItems = cartItems?.reduce((acc, item) => {
    const clinicName = allClinics.find(c => c.clinicId === item.clinicId)?.clinicName || item.clinicId || 'Unassigned';
    (acc[clinicName] = acc[clinicName] || []).push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);
  
  const getVendorNameById = (vendorId: string): string => {
    return allAvailableVendors.find(v => v.id === vendorId)?.name || vendorId;
  };

   const getClinicNameById = (clinicId: string): string => {
    return allClinics.find(c => c.clinicId === clinicId)?.clinicName || clinicId;
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };
  
  const handleSelectClinicGroup = (clinicName: string, checked: boolean) => {
    if (!groupedItems) return;
    const itemsInGroup = groupedItems[clinicName]?.map(item => item.id) || [];
    const areAllSelectedInGroup = itemsInGroup.every(id => selectedItems.includes(id));
    
    if (checked || !areAllSelectedInGroup) {
        setSelectedItems(prev => [...new Set([...prev, ...itemsInGroup])]);
    } else {
        setSelectedItems(prev => prev.filter(id => !itemsInGroup.includes(id)));
    }
  };

  const handleAssignVendor = (vendorId: string) => {
    updateVendorForSelectedItems(selectedItems, vendorId);
    setSelectedItems([]); // Clear selection after assignment
  };

  const handleAssignClinic = (clinicId: string) => {
    updateClinicForSelectedItems(selectedItems, clinicId);
    setSelectedItems([]);
  };

  const subtotal = cartItems?.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0;
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotal) : 0;
  const finalTotal = subtotal - walletDeduction;

  if (product) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogDescription>Select your purchase option and quantity.</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                  {product.isDynamic && product.marketRateInfo && (
                      <DynamicPriceCard marketRateInfo={product.marketRateInfo} />
                  )}
                  {product.mrp && (
                     <RadioGroup value={purchaseOption} onValueChange={(v) => setPurchaseOption(v as any)}>
                        <div className="grid grid-cols-2 gap-4">
                        <Label htmlFor="option-discounted" className={cn("border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer", purchaseOption === 'discounted' && "ring-2 ring-primary")}>
                            <RadioGroupItem value="discounted" id="option-discounted" className="sr-only" />
                            <p className="text-xl font-bold">₹{product.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Discounted Price</p>
                        </Label>
                        <Label htmlFor="option-mrp" className={cn("border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer", purchaseOption === 'mrp' && "ring-2 ring-primary")}>
                            <RadioGroupItem value="mrp" id="option-mrp" className="sr-only" />
                            <p className="text-xl font-bold">₹{product.mrp.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">MRP</p>
                            <Badge variant="success" className="mt-1">Earn ₹{(product.mrp - product.price).toLocaleString()} Commission</Badge>
                        </Label>
                        </div>
                    </RadioGroup>
                  )}

                  <div className="flex items-center gap-4 justify-center">
                    <Label htmlFor="quantity" className="text-right">
                    Quantity
                    </Label>
                    <Input
                    id="quantity"
                    type="number"
                    min={5}
                    step={5}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 5)}
                    className="w-24"
                    />
                  </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleConfirmAddToCart}>Add to Cart</Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      );
  }

  if (cartItems) {
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Your Cart</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] flex flex-col">
                        <div className="flex justify-between items-center mb-2 p-1 gap-2">
                            <Label>Grouped by Clinic</Label>
                            <div className="flex gap-2">
                               <VendorAssignmentDropdown
                                    selectedItemIds={selectedItems}
                                    onAssign={handleAssignVendor}
                                    allVendors={allAvailableVendors}
                                />
                                <ClinicAssignmentDropdown
                                    selectedItemIds={selectedItems}
                                    onAssign={handleAssignClinic}
                                    allClinics={allClinics}
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1 pr-4">
                            {cartItems.length > 0 && groupedItems ? (
                            Object.entries(groupedItems).map(([clinicName, clinicItems]) => {
                                const areAllSelected = clinicItems.every(item => selectedItems.includes(item.id));
                                return (
                                    <div key={clinicName} className="mb-6">
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded-t-md">
                                             <Checkbox
                                                id={`select-clinic-${clinicName}`}
                                                checked={areAllSelected}
                                                onCheckedChange={(checked) => handleSelectClinicGroup(clinicName, !!checked)}
                                             />
                                             <Label htmlFor={`select-clinic-${clinicName}`} className="text-base font-semibold flex items-center gap-2 cursor-pointer"><Building size={16}/> {clinicName}</Label>
                                        </div>
                                        <div className="space-y-4 p-2 border border-t-0 rounded-b-md">
                                            {clinicItems.map(item => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <Checkbox
                                                        id={`select-item-${item.id}`}
                                                        checked={selectedItems.includes(item.id)}
                                                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                                                    />
                                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border object-cover" />
                                                    <div className="flex-grow">
                                                        <p className="font-medium text-sm">{item.name}</p>
                                                        <Badge variant="outline" className="mt-1 font-normal text-xs bg-sky-100 text-sky-800 border-sky-200">
                                                          Supplied by: {getVendorNameById(item.vendorId)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 5)} disabled={item.quantity <= 5}><Minus size={12}/></Button>
                                                        <span>{item.quantity}</span>
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 5)}><Plus size={12}/></Button>
                                                    </div>
                                                    <p className="text-sm font-medium w-20 text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    <Button variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => removeItem(item.id)}><Trash2 size={14}/></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )})
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Your cart is empty.</p>
                            )}
                        </ScrollArea>
                    </div>
                    {cartItems.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <Label>Subtotal</Label>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="use-wallet" checked={useWallet} onCheckedChange={(checked) => setUseWallet(checked as boolean)} />
                                        <Label htmlFor="use-wallet" className="flex items-center gap-2 cursor-pointer">
                                            <Wallet size={16} /> Use Wallet Balance (Available: ₹{walletBalance.toLocaleString()})
                                        </Label>
                                    </div>
                                    <span className="text-green-600">- ₹{walletDeduction.toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total Payable</span>
                                    <span>₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <DialogFooter className="sm:justify-between">
                                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                                <Button onClick={handleCreatePO}>Create Purchase Order(s)</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
  }

  return null;
}

export default CartDialog;

    