
'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { addClinic, updateClinic } from '@/services/clinic.service'; // Updated to use service
import type { Clinic, UserProfile } from '@/types';
import { Separator } from '@/components/ui/separator';
import { getDiscoverableUsers } from '@/services/user.service';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Loader2, Save, UserSearch } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/app/contexts/AuthContext';


const clinicFormSchema = z.object({
  clinicName: z.string().min(3, { message: "Clinic name must be at least 3 characters." }),
  location: z.string().min(10, { message: "Address is required." }),
  doctorId: z.string().min(1, 'A doctor must be assigned to the clinic.'),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

interface ClinicFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void; // General callback for success
  clinicData?: Partial<Clinic> | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isEditing ? 'Update Clinic' : 'Save Clinic'}
    </Button>
  );
}

const ClinicForm: React.FC<ClinicFormProps> = ({ open, onOpenChange, onSubmit = () => {}, clinicData }) => {
  const { toast } = useToast();
  const isEditing = !!clinicData?.clinicId;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const { user } = useAuth();

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      clinicName: clinicData?.clinicName || '',
      location: clinicData?.location || '',
      doctorId: clinicData?.doctorId || user?._id || '',
    },
  });

  useEffect(() => {
    getDiscoverableUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (open) {
      form.reset({
        clinicName: clinicData?.clinicName || '',
        location: clinicData?.location || '',
        doctorId: clinicData?.doctorId || user?._id || '',
      });
    }
  }, [clinicData, open, form, user]);

  const handleFormSubmit = async (values: ClinicFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && clinicData?.clinicId) {
        await updateClinic(clinicData.clinicId, values);
        toast({ title: 'Clinic Updated', description: `${values.clinicName} has been updated.` });
      } else {
        await addClinic(values as Omit<Clinic, 'clinicId'>);
        toast({ title: 'Clinic Created', description: `${values.clinicName} has been added.` });
      }
      onSubmit();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save clinic.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userOptions = users.map(u => ({ value: u._id, label: `${u.name} - ${u.experience?.[0]?.title || u.career_stage}` }));
  // Add current user if not in the list
  if (user && !userOptions.find(u => u.value === user._id)) {
      userOptions.unshift({ value: user._id, label: `${user.name} (Me)` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Clinic Branch' : 'Add New Clinic Branch'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this clinic location.' : 'Enter the details for the new clinic location.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><UserSearch /> Assign Doctor*</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={userOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      onSelect={(value) => field.onChange(value)}
                      placeholder="Search for a doctor..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField control={form.control} name="clinicName" render={({ field }) => (
                <FormItem><FormLabel>Clinic Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Address*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditing ? 'Update Clinic' : 'Save Clinic'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicForm;
