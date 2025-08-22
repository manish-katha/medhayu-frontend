
'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { Info, Image as ImageIcon, Home, Edit, Package, MapPin, ArrowDownCircle, ArrowUpCircle, ShoppingCart, DollarSign, Percent, Save, X, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StockStatusBadge from './StockStatusBadge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateItemReorderPoint } from '@/actions/inventory.actions';


interface InventoryItemViewProps {
  item: InventoryItem;
}

const DetailItem = ({ label, value, className = '' }: { label: string; value: React.ReactNode, className?: string }) => (
    <div className={cn("grid grid-cols-2 items-center gap-2 text-sm", className)}>
        <div className="text-muted-foreground">{label}</div>
        <div className="font-medium text-right md:text-left">{value || 'N/A'}</div>
    </div>
);

const StockCard = ({ title, value }: { title: string, value: number}) => (
    <div className="bg-muted/50 p-3 rounded-lg flex-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="font-semibold text-lg">{value.toFixed(2)}</p>
    </div>
);

const branchStock = [
    { name: 'Jayanagar (HO)', stock: 15, committed: 2, available: 13 },
    { name: 'Indiranagar', stock: 8, committed: 0, available: 8 },
    { name: 'Koramangala', stock: 0, committed: 0, available: 0 },
];

const mockTransactions = [
    { date: new Date(2025, 6, 15), type: 'Sales Invoice', id: 'INV-2025-042', qty: -5, branch: 'Jayanagar (HO)' },
    { date: new Date(2025, 6, 12), type: 'Purchase Bill', id: 'PB-2025-015', qty: 20, branch: 'Jayanagar (HO)' },
    { date: new Date(2025, 6, 10), type: 'Sales Invoice', id: 'INV-2025-038', qty: -3, branch: 'Indiranagar' },
    { date: new Date(2025, 6, 5), type: 'Stock Adjustment', id: 'ADJ-2025-004', qty: -1, branch: 'Jayanagar (HO)' },
    { date: new Date(2025, 6, 1), type: 'Opening Stock', id: 'N/A', qty: 15, branch: 'Jayanagar (HO)' },
];


const InventoryItemView: React.FC<InventoryItemViewProps> = ({ item }) => {
    const { toast } = useToast();
    const [isEditingReorder, setIsEditingReorder] = useState(false);
    const [reorderPoint, setReorderPoint] = useState(item.lowStockThreshold ?? 0);

    const handleSaveReorderPoint = async () => {
        if (!item.id) return;
        const result = await updateItemReorderPoint(item.id, reorderPoint);
        if (result.success) {
            toast({ title: "Reorder point updated successfully" });
            setIsEditingReorder(false);
        } else {
            toast({ title: "Failed to update reorder point", description: result.error, variant: "destructive" });
        }
    };

    return (
        <div className="w-full">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Info size={18}/>Item Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <DetailItem label="Item Type" value="Inventory Items" />
                                    <DetailItem label="SKU" value={item.itemCode} />
                                    <DetailItem label="Category" value={item.category} />
                                    <DetailItem label="HSN Code" value={item.hsnCode} />
                                    <DetailItem label="Unit" value={item.unit} />
                                    <DetailItem label="Manufacturer" value={item.supplierInfo} />
                                    <DetailItem label="Brand" value={"OSHADHAM"} />
                                    <DetailItem label="Service or Product" value={<Badge variant="outline" className="capitalize">{item.serviceOrProduct}</Badge>} />
                                    <DetailItem label="Item Classification" value={<Badge variant="outline" className="capitalize">{item.itemClassification}</Badge>} />
                                </CardContent>
                            </Card>

                            <Card>
                                 <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><DollarSign size={18}/>Sales & Purchase</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-3">
                                        <h4 className="font-medium text-muted-foreground">Sales Information</h4>
                                        <DetailItem label="Selling Price" value={`₹${item.salePrice.toFixed(2)}`} />
                                        <DetailItem label="Sales Account" value={"Sales"} />
                                        <DetailItem label="Description" value={item.description} />
                                        <DetailItem label="Tax Preference" value={"Taxable"} />
                                        <div className="grid grid-cols-2 items-center text-sm">
                                            <div className="text-muted-foreground flex items-center gap-1"><Percent size={14}/>Tax Rate</div>
                                            <div className="font-medium text-right md:text-left">
                                                <Badge variant="secondary">Intra State: GST5 ({item.gstPercentage}%)</Badge>
                                                <Badge variant="secondary" className="mt-1">Inter State: IGST5 ({item.gstPercentage}%)</Badge>
                                            </div>
                                        </div>
                                     </div>
                                     <div className="space-y-3">
                                        <h4 className="font-medium text-muted-foreground">Purchase Information</h4>
                                        <DetailItem label="Cost Price" value={`₹${item.purchasePrice?.toFixed(2) ?? '0.00'}`} />
                                        <DetailItem label="Purchase Account" value={"Cost of Goods Sold"} />
                                     </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-2"><ImageIcon size={18}/>Product Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground space-y-2">
                                        <ImageIcon size={48} className="mx-auto" />
                                        <p className="text-sm">Drag image(s) here or <Button variant="link" className="p-0 h-auto">Browse images</Button></p>
                                        <p className="text-xs">You can add up to 15 images, each not exceeding 5 MB in size.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-2"><Package size={18}/>Stock Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   <div className="flex items-center gap-2">
                                     <Home size={16} className="text-muted-foreground" />
                                     <h4 className="font-medium">Opening Stock: {item.openingStock.toFixed(2)}</h4>
                                   </div>

                                   <div className="space-y-1">
                                        <div className="font-medium flex items-center gap-1 text-sm">Accounting Stock <Info size={12}/></div>
                                        <div className="space-y-1 pl-4 border-l-2 ml-2">
                                            <DetailItem label="Stock on Hand" value={item.stock?.toFixed(2) ?? '0.00'} />
                                            <DetailItem label="Committed Stock" value={"0.00"} />
                                            <DetailItem label="Available for Sale" value={item.stock?.toFixed(2) ?? '0.00'} />
                                        </div>
                                   </div>
                                    <div className="space-y-1">
                                        <div className="font-medium flex items-center gap-1 text-sm">Physical Stock <Info size={12}/></div>
                                         <div className="space-y-1 pl-4 border-l-2 ml-2">
                                            <DetailItem label="Stock on Hand" value={item.stock?.toFixed(2) ?? '0.00'} />
                                            <DetailItem label="Committed Stock" value={"0.00"} />
                                            <DetailItem label="Available for Sale" value={item.stock?.toFixed(2) ?? '0.00'} />
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                        <StockCard title="Qty to be Shipped" value={0} />
                                        <StockCard title="Qty to be Received" value={0} />
                                        <StockCard title="Qty to be Invoiced" value={0} />
                                        <StockCard title="Qty to be Billed" value={0} />
                                   </div>

                                   <div>
                                     <div className="text-sm">Reorder Point</div>
                                     {isEditingReorder ? (
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="number" 
                                                value={reorderPoint}
                                                onChange={(e) => setReorderPoint(Number(e.target.value))}
                                                className="h-8 w-24"
                                            />
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600" onClick={handleSaveReorderPoint}><Check size={14}/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600" onClick={() => setIsEditingReorder(false)}><X size={14}/></Button>
                                        </div>
                                     ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{item.lowStockThreshold?.toFixed(2) ?? '0.00'}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingReorder(true)}><Edit size={14}/></Button>
                                        </div>
                                     )}
                                   </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="locations" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin size={18}/>
                                Warehouse Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Stock on Hand</TableHead>
                                        <TableHead>Committed Stock</TableHead>
                                        <TableHead>Available for Sale</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {branchStock.map((branch) => (
                                        <TableRow key={branch.name}>
                                            <TableCell className="font-medium">{branch.name}</TableCell>
                                            <TableCell>{branch.stock}</TableCell>
                                            <TableCell>{branch.committed}</TableCell>
                                            <TableCell>{branch.available}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="transactions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Document ID</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Branch</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockTransactions.map((tx, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{format(tx.date, 'PPP')}</TableCell>
                                            <TableCell className="font-medium">{tx.type}</TableCell>
                                            <TableCell>{tx.id}</TableCell>
                                            <TableCell className={cn("font-semibold", tx.qty > 0 ? "text-green-600" : "text-red-600")}>
                                                <span className="flex items-center gap-1">
                                                    {tx.qty > 0 ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                                                    {tx.qty}
                                                </span>
                                            </TableCell>
                                            <TableCell>{tx.branch}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="history" className="mt-4">
                    <p className="text-muted-foreground">Item adjustment history will be shown here.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InventoryItemView;

