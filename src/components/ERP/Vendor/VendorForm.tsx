
'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Landmark } from 'lucide-react';
import { createVendor as createVendorAction } from '@/actions/vendor.actions';
import { addVendor as addVendorService } from '@/services/vendor.service';
import { Vendor, vendorSchema } from '@/types/vendor';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface VendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSuccess: (newVendor: Vendor) => void;
  initialData?: Vendor | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? 'Update Vendor' : 'Save Vendor'}
        </Button>
    );
}

const VendorForm: React.FC<VendorFormProps> = ({ open, onOpenChange, onFormSuccess, initialData }) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<Vendor>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        pan: '',
        upiId: '',
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: ''
        }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '', pan: '', upiId: '',
        bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '' }
      });
    }
  }, [initialData, open, form]);
  
  const handleFormSubmit = async (values: Vendor) => {
    setIsSubmitting(true);
    try {
        const newVendor = await addVendorService(values);
        toast({
            title: "Vendor Created",
            description: `${newVendor.name} has been added to your vendors list.`
        });
        onFormSuccess(newVendor);
    } catch(error) {
        toast({
            title: "Error",
            description: "Failed to create vendor.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this vendor.' : 'Enter the details for the new vendor.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} ref={formRef} className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Vendor Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="contactPerson" render={({ field }) => ( <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="gstin" render={({ field }) => ( <FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="pan" render={({ field }) => ( <FormItem><FormLabel>PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                
                <Separator />
                <h4 className="font-medium text-lg flex items-center gap-2"><Landmark size={18}/> Payment Details</h4>
                <FormField control={form.control} name="upiId" render={({ field }) => ( <FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="bankDetails.accountHolderName" render={({ field }) => ( <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="bankDetails.accountNumber" render={({ field }) => ( <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="bankDetails.bankName" render={({ field }) => ( <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="bankDetails.ifscCode" render={({ field }) => ( <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>

                <DialogFooter className="sticky bottom-0 bg-background py-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                     <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Update Vendor' : 'Save Vendor'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
