
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OnboardingFormValues } from '../formSchema';

const AccountInfoStep: React.FC = () => {
  const { control } = useFormContext<OnboardingFormValues>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Account Information</h3>
      <FormField
        control={control}
        name="account.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="account.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="account.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="account.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
          control={control}
          name="account.profilePictureUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL (Optional)</FormLabel>
              <FormControl><Input {...field} placeholder="https://..." /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    </div>
  );
};

export default AccountInfoStep;
