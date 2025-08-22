
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PrescriptionPadEditor from "@/components/prescription/PrescriptionPadEditor";

const PrescriptionTab = () => {
  return (
    <div className="space-y-6">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={18} />
            Prescription Pad Design
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your clinic's prescription pad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionPadEditor />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionTab;
