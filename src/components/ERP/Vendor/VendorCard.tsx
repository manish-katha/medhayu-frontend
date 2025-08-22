
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Phone, Mail, Edit, MoreVertical, Landmark } from 'lucide-react';
import { Vendor } from '@/types/vendor';
import { Separator } from '@/components/ui/separator';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-ayurveda-green/10 p-3 rounded-full">
              <Building className="h-6 w-6 text-ayurveda-green" />
            </div>
            <div>
              <CardTitle className="text-lg">{vendor.name}</CardTitle>
              {vendor.contactPerson && <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>}
            </div>
          </div>
           <Button variant="ghost" size="icon">
             <MoreVertical className="h-4 w-4" />
           </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {vendor.address}
        </div>
        <Separator />
        <div className="flex items-center text-sm">
          <Phone size={14} className="mr-2 text-muted-foreground" />
          <span>{vendor.phone}</span>
        </div>
        {vendor.email && (
            <div className="flex items-center text-sm">
            <Mail size={14} className="mr-2 text-muted-foreground" />
            <span>{vendor.email}</span>
            </div>
        )}
        {vendor.gstin && (
            <div className="font-mono text-xs flex items-center">
                <span className="font-sans text-muted-foreground mr-2">GSTIN:</span> {vendor.gstin}
            </div>
        )}
        {vendor.bankDetails?.accountNumber && (
            <div className="flex items-center text-sm text-green-700">
              <Landmark size={14} className="mr-2" />
              <span>Bank details on file</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" onClick={() => onEdit(vendor)}>
          <Edit size={14} className="mr-2" /> Manage Vendor
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VendorCard;
