
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Phone, Mail, FileText, Edit, MoreVertical } from 'lucide-react';
import type { Clinic } from '@/types/user';

interface ClinicCardProps extends Clinic {
  onEdit: (id: string) => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ clinicId, clinicName, location, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-ayurveda-green/10 p-3 rounded-full">
              <Building className="h-6 w-6 text-ayurveda-green" />
            </div>
            <div>
              <CardTitle className="text-lg">{clinicName}</CardTitle>
              {/* Status can be added back if needed */}
            </div>
          </div>
           <Button variant="ghost" size="icon">
             <MoreVertical className="h-4 w-4" />
           </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {location}
        </div>
        {/* Phone, email, GSTIN can be added if available in the model */}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" onClick={() => onEdit(clinicId)}>
          <Edit size={14} className="mr-2" /> Manage Clinic
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicCard;
