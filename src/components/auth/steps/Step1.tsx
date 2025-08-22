
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Step1Props {
  data: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Step1({ data, handleChange }: Step1Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstname">First Name</Label>
          <Input id="firstname" name="firstname" value={data.firstname} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" name="lastname" value={data.lastname} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={data.email} onChange={handleChange} required />
      </div>
       <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" value={data.phone} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={data.password} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" value={data.confirmPassword} onChange={handleChange} required />
        </div>
      </div>
    </div>
  );
}
