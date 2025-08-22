
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StudentDetailsStep: React.FC = () => {
    const { control } = useFormContext();
  return (
    <div className="space-y-4">
       <h3 className="text-lg font-semibold">Education Details</h3>
      <FormField
        control={control}
        name="student.collegeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>College Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="student.courseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                  <SelectContent>
                      <SelectItem value="BAMS">BAMS</SelectItem>
                      <SelectItem value="MD_MS">MD/MS</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="student.yearOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Study</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                  <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="Final Year">Final Year</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default StudentDetailsStep;
