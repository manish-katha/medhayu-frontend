
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Package, AlertCircle, Grid, List, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import InventoryItem from '@/components/Inventory/InventoryItem';
import InventoryItemForm from '@/components/Inventory/InventoryItemForm';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { deleteInventoryItem } from '@/actions/inventory.actions';
import { EmptyState } from '@/components/ui/empty-state';
import { getInventoryItems } from '@/services/inventory.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StockStatusBadge from '@/components/Inventory/StockStatusBadge';
import { cn } from '@/lib/utils';
import FilterPanel from '@/components/MarketPlace/FilterPanel';
import { differenceInMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface InventoryClientPageProps {
  initialInventory: InventoryItemType[];
}

const InventoryItemSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-grow p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-muted/50">
             <Skeleton className="h-6 w-12" />
          </div>
        </div>
         <div className="flex justify-end gap-2 p-2 border-t">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-20" />
         </div>
      </CardContent>
    </Card>
);


const InventoryClientPage = ({ initialInventory }: InventoryClientPageProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState<InventoryItemType[]>(initialInventory);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();


  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [selectedExpiry, setSelectedExpiry] = useState<string[]>([]);


  const fetchItems = async () => {
    setIsLoading(true);
    try {
        const items = await getInventoryItems();
        setInventoryData(items);
    } catch (error) {
        toast({ title: 'Error fetching inventory', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [])

  const handleEdit = (item: InventoryItemType) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteInventoryItem(id);
    if (result.success) {
      toast({ title: 'Item Deleted', description: 'The inventory item has been removed.' });
      fetchItems();
    } else {
      toast({ title: 'Deletion Failed', description: result.error, variant: 'destructive' });
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    fetchItems();
  }

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  const getStockStatus = (stock: number, threshold: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  const filteredItems = useMemo(() => inventoryData.filter(item => {
    const status = getStockStatus(item.stock, item.lowStockThreshold || 10).toLowerCase().replace(' ', '');
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let tabMatch = false;
    if (activeTab === 'all') tabMatch = true;
    if (activeTab === 'lowstock' && status === 'lowstock') tabMatch = true;
    if (activeTab === 'outofstock' && status === 'outofstock') tabMatch = true;
    if (!tabMatch) return false;

    // Category filter
    if (selectedCategories.length > 0) {
      const itemCategory = item.category?.toLowerCase();
      if (!itemCategory || !selectedCategories.some(sc => itemCategory.includes(sc.toLowerCase()))) {
          return false;
      }
    }

    // Price range filter
    if (item.salePrice < priceRange[0] || item.salePrice > priceRange[1]) {
        return false;
    }
    
    // Expiry filter
    if (selectedExpiry.length > 0) {
        if (!item.expiryDate) return false; // If item has no expiry date, it can't match.
        try {
            const monthsToExpiry = differenceInMonths(new Date(item.expiryDate), new Date());
            const expiryMatch = selectedExpiry.some(period => {
                if (period === "Less than 6 months" && monthsToExpiry < 6 && monthsToExpiry >= 0) return true;
                if (period === "6-12 months" && monthsToExpiry >= 6 && monthsToExpiry <= 12) return true;
                if (period === "1-2 years" && monthsToExpiry > 12 && monthsToExpiry <= 24) return true;
                if (period === "More than 2 years" && monthsToExpiry > 24) return true;
                return false;
            });
            if (!expiryMatch) return false;
        } catch (e) {
            return true; // Don't filter out if date is invalid
        }
    }


    return searchMatch;
  }), [inventoryData, searchQuery, activeTab, selectedCategories, priceRange, selectedExpiry]);
  
  const renderContent = () => {
     if (isLoading) {
        if (view === 'grid') {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <InventoryItemSkeleton key={i} />)}
                </div>
            )
        }
        return (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
      }
      
      if (filteredItems.length === 0) {
        return (
            <EmptyState
                icon={<Search />}
                title="No Items Found"
                description="Your inventory seems to be empty or doesn't match your search. Add a new item to get started."
                action={{
                    label: "Add New Item",
                    onClick: handleAddNew
                }}
            />
          )
      }
      
      if (view === 'list') {
        return (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sale Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map(item => (
                            <TableRow key={item.id} className="cursor-pointer" onClick={() => item.id && router.push(`/erp/inventory/${item.id}`)}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.stock}</TableCell>
                                <TableCell><StockStatusBadge status={getStockStatus(item.stock, item.lowStockThreshold || 10)} /></TableCell>
                                <TableCell>₹{item.salePrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right space-x-1" onClick={e => e.stopPropagation()}>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => item.id && router.push(`/erp/inventory/${item.id}`)}><Eye size={14} /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Edit size={14} /></Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id!)}><Trash2 size={14} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
      }
      
      return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
            <InventoryItem key={item.id} {...item} onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id!)} />
            ))}
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your clinic's stock of medicines and herbs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>
      
       <div className="flex gap-6 items-start">
        {showFilters && (
          <div className="w-1/4 hidden lg:block">
            <FilterPanel 
              onCategoryChange={setSelectedCategories}
              onPriceChange={setPriceRange}
              onExpiryChange={setSelectedExpiry}
            />
          </div>
        )}
        <div className={cn("flex-grow", showFilters && "lg:w-3/4")}>
          <Card>
            <CardHeader>
               <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                        placeholder="Search inventory..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal size={14} />
                    </Button>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">
                    <Package size={14} className="mr-1" /> All Items
                    <Badge className="ml-2">{inventoryData.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="lowstock">
                    <AlertCircle size={14} className="mr-1" /> Low Stock
                    <Badge variant="warning" className="ml-2">
                      {inventoryData.filter(item => getStockStatus(item.stock, item.lowStockThreshold || 10) === 'Low Stock').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="outofstock">
                    <AlertCircle size={14} className="mr-1" /> Out of Stock
                    <Badge variant="destructive" className="ml-2">
                      {inventoryData.filter(item => getStockStatus(item.stock, item.lowStockThreshold || 10) === 'Out of Stock').length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <InventoryItemForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onFormSuccess={handleFormSuccess}
        initialData={editingItem}
      />
    </div>
  );
};

export default InventoryClientPage;
