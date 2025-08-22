
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingFormValues } from '../formSchema';

const RoleSelectionStep: React.FC = () => {
    const { control } = useFormContext<OnboardingFormValues>();
  return (
    <Controller
      name="role"
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xl font-semibold block text-center mb-6">Choose Your Role</FormLabel>
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormItem>
              <label
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  field.value === 'student' && "border-primary"
                )}
              >
                <RadioGroupItem value="student" className="sr-only" />
                <User className="mb-3 h-8 w-8" />
                Student
              </label>
            </FormItem>
            <FormItem>
              <label
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  field.value === 'doctor' && "border-primary"
                )}
              >
                <RadioGroupItem value="doctor" className="sr-only" />
                <Stethoscope className="mb-3 h-8 w-8" />
                Doctor
              </label>
            </FormItem>
          </RadioGroup>
        </FormItem>
      )}
    />
  );
};

export default RoleSelectionStep;
