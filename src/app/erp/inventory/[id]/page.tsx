

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getInventoryItem } from '@/services/inventory.service';
import InventoryItemView from '@/components/Inventory/InventoryItemView';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, X } from 'lucide-react';

interface InventoryItemPageProps {
  params: { id: string };
}

export default async function InventoryItemPage({ params: paramsProp }: InventoryItemPageProps) {
  const params = use(paramsProp);
  const item = await getInventoryItem(params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <Breadcrumb className="mt-1">
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/erp/inventory">Inventory</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Edit size={16} className="mr-2"/>Edit</Button>
            <Button>Adjust Stock</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Clone Item</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Inactive</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
                <X size={20} />
            </Button>
        </div>
      </div>
      <InventoryItemView item={item} />
    </div>
  );
}
