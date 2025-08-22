
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface DoctorDetailsStepProps {
  isPgStudent: boolean;
}

const DoctorDetailsStep: React.FC<DoctorDetailsStepProps> = ({ isPgStudent }) => {
    const { control } = useFormContext();
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Medical Details</h3>
        <FormField
          control={control}
          name="doctor.collegeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College where you completed your degree</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="doctor.practitionerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Practitioner ID / Registration Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={control}
            name="doctor.isPgStudent"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <FormLabel>Are you currently pursuing a PG degree?</FormLabel>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
            )}
        />
        {isPgStudent ? (
             <FormField
                control={control}
                name="doctor.pgCollegeName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current PG College Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        ) : (
             <FormField
                control={control}
                name="doctor.specialization"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
    </div>
  );
};

export default DoctorDetailsStep;
