
'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const PracticeDetailsStep: React.FC = () => {
    const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "doctor.clinics",
  });

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Practice Details</h3>
        {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                <FormField
                    control={control}
                    name={`doctor.clinics.${index}.name`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name={`doctor.clinics.${index}.address`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinic Address</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {index > 0 && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 h-6 w-6"
                    >
                        <Trash2 size={14} />
                    </Button>
                )}
            </div>
        ))}

        <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', address: '' })}
        >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Clinic
        </Button>
    </div>
  );
};

export default PracticeDetailsStep;
