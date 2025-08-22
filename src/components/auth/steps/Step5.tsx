
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Step5Props {
  data: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isStudent: boolean;
}

export function Step5({ data, handleChange, isStudent }: Step5Props) {
  const handleSelectChange = (name: string) => (value: string) => {
    handleChange({ target: { name, value } } as any);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Practice / Clinic Name</Label>
        <Input name="practiceCenterName" value={data.practiceCenterName} onChange={handleChange} placeholder={isStudent ? 'Name of your future clinic...' : ''}/>
      </div>
      
      {!isStudent && (
        <>
          <div>
            <Label>Practice / Clinic Address</Label>
            <Input name="practiceCenterAddress" value={data.practiceCenterAddress} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Practice Center Type</Label>
              <Select onValueChange={handleSelectChange('practiceCenterType')} value={data.practiceCenterType}>
                <SelectTrigger><SelectValue placeholder="Select center type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="wellness-center">Wellness Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Workspace Type</Label>
              <Select onValueChange={handleSelectChange('workspaceType')} value={data.workspaceType}>
                <SelectTrigger><SelectValue placeholder="Select workspace type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owned">Owned</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="visiting">Visiting Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
