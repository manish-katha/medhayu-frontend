
'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Vendor } from '@/types/vendor';
import VendorCard from '@/components/ERP/Vendor/VendorCard';
import { EmptyState } from '@/components/ui/empty-state';
import VendorForm from '@/components/ERP/Vendor/VendorForm';
import { useToast } from '@/hooks/use-toast';
import { getVendors } from '@/services/vendor.service';

interface VendorClientPageProps {
  initialVendors: Vendor[];
}

const VendorClientPage: React.FC<VendorClientPageProps> = ({ initialVendors }) => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
        const updatedVendors = await getVendors();
        setVendors(updatedVendors);
    } catch (error) {
        toast({ title: 'Error fetching vendors', variant: 'destructive' });
    }
  };

  const handleAddNew = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchVendors();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and their information.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search vendors..." className="pl-8" />
            </div>
            <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                New Vendor
            </Button>
        </div>
      </div>
      
      {vendors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <EmptyState
            icon={<Search />}
            title="No Vendors Found"
            description="Get started by creating your first vendor."
            action={{
                label: "Add New Vendor",
                onClick: handleAddNew
            }}
        />
      )}

      <VendorForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onFormSuccess={handleFormSuccess}
        initialData={editingVendor}
      />
    </div>
  );
};

export default VendorClientPage;
