
'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step3Props {
  data: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Step3({ data, handleChange }: Step3Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="isBams"
          name="isBams"
          checked={data.isBams}
          onCheckedChange={(checked) => handleChange({ target: { name: 'isBams', value: String(checked), type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isBams" className="font-normal">BAMS (Bachelor of Ayurvedic Medicine and Surgery)</Label>
      </div>
      {data.isBams && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md ml-8">
          <div><Label>UG College Name</Label><Input name="ugCLgName" value={data.ugCLgName} onChange={handleChange} /></div>
          <div><Label>Pincode</Label><Input name="ugPincode" value={data.ugPincode} onChange={handleChange} /></div>
          <div><Label>Batch</Label><Input name="Batch" value={data.Batch} onChange={handleChange} /></div>
        </div>
      )}

      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="isMdMs"
          name="isMdMs"
          checked={data.isMdMs}
          onCheckedChange={(checked) => handleChange({ target: { name: 'isMdMs', value: String(checked), type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isMdMs" className="font-normal">MD/MS (Ayurveda)</Label>
      </div>
      {data.isMdMs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md ml-8">
          <div><Label>PG College Name</Label><Input name="pgClgName" value={data.pgClgName} onChange={handleChange} /></div>
          <div><Label>Pincode</Label><Input name="pgPinCode" value={data.pgPinCode} onChange={handleChange} /></div>
          <div><Label>Specialization</Label><Input name="specialization" value={data.specialization} onChange={handleChange} /></div>
        </div>
      )}
    </div>
  );
}
