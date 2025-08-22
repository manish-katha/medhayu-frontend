
'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Step2Props {
  data: any;
  handleRadioChange: (name: string, value: string) => void;
}

export function Step2({ data, handleRadioChange }: Step2Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please select your current professional role.
      </p>
      <RadioGroup
        name="professionalRole"
        value={data.professionalRole}
        onValueChange={(value) => handleRadioChange('professionalRole', value)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2 rounded-md border p-4">
          <RadioGroupItem value="student" id="role-student" />
          <Label htmlFor="role-student" className="font-normal cursor-pointer">
            I am a Student
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-md border p-4">
          <RadioGroupItem value="doctor" id="role-doctor" />
          <Label htmlFor="role-doctor" className="font-normal cursor-pointer">
            I am a Doctor / Practitioner
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
