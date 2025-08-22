
'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Step4Props {
  data: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function Step4({ data, handleChange }: Step4Props) {
  const handleSelectChange = (name: string) => (value: string) => {
    handleChange({ target: { name, value } } as any);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="isDoctor"
          name="isDoctor"
          checked={data.isDoctor}
          onCheckedChange={(checked) => handleChange({ target: { name: 'isDoctor', value: String(checked), type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isDoctor" className="font-normal">I am a Doctor</Label>
      </div>
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="isSpecialist"
          name="isSpecialist"
          checked={data.isSpecialist}
          onCheckedChange={(checked) => handleChange({ target: { name: 'isSpecialist', value: String(checked), type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isSpecialist" className="font-normal">I am a Specialist</Label>
      </div>
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="isPracticener"
          name="isPracticener"
          checked={data.isPracticener}
          onCheckedChange={(checked) => handleChange({ target: { name: 'isPracticener', value: String(checked), type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isPracticener" className="font-normal">I am a Practitioner</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Work Type</Label>
          <Select onValueChange={handleSelectChange('workType')} value={data.workType}>
            <SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private Practice</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="teaching">Teaching</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Registration No.</Label>
          <Input name="registerationNo" value={data.registerationNo} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label>Future Plans</Label>
        <Input name="futurePlan" placeholder="Your professional goals..." value={data.futurePlan} onChange={handleChange} />
      </div>
    </div>
  );
}
