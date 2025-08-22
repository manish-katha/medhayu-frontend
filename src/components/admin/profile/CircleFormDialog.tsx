
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { createCircle } from '@/actions/circle.actions';
import { Loader2, Save, Users, BookOpen, Building, Globe, Lock, UserPlus, Camera } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MediaSelectorSheet } from '../media-selector-sheet';

const circleFormSchema = z.object({
  name: z.string().min(3, "Circle name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  rules: z.string().optional(),
  category: z.enum(['clinical', 'shastra', 'institutional']),
  type: z.enum(['personal', 'organization']),
  privacy: z.enum(['public', 'private', 'invite-only']),
  avatarUrl: z.string().url().optional(),
});

type CircleFormValues = z.infer<typeof circleFormSchema>;

interface CircleFormDialogProps {
  trigger: React.ReactNode;
  category: 'clinical' | 'shastra' | 'institutional';
  onCircleCreated?: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Create Circle
    </Button>
  );
}

export function CircleFormDialog({ trigger, category, onCircleCreated }: CircleFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createCircle, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState('/media/default-circle-avatar.png');

  const form = useForm<CircleFormValues>({
    resolver: zodResolver(circleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      rules: '',
      category: category,
      type: 'personal',
      privacy: 'private',
      avatarUrl: '/media/default-circle-avatar.png'
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        rules: '',
        category: category,
        type: 'personal',
        privacy: 'private',
        avatarUrl: '/media/default-circle-avatar.png'
      });
      setAvatarUrl('/media/default-circle-avatar.png');
    }
  }, [open, category, form]);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
      setOpen(false);
      onCircleCreated?.();
    }
    if (state?.error && !state.fieldErrors) {
      toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  }, [state, toast, onCircleCreated]);
  
  const handleFormSubmit = (data: CircleFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.set('avatarUrl', avatarUrl); // Ensure the avatarUrl from state is used
    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
          <DialogDescription>Fill in the details for your new community group.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form ref={formRef} action={formAction} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <input type="hidden" {...form.register('category')} />
                
                <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Circle Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Purpose / Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                     <div className="space-y-2">
                        <FormLabel>Circle Avatar</FormLabel>
                        <MediaSelectorSheet onSelectImage={setAvatarUrl}>
                             <button type="button" className="relative h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center group bg-muted hover:border-primary">
                                <Image src={avatarUrl} alt="Circle avatar preview" fill className="object-cover rounded-full"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-white"/>
                                </div>
                            </button>
                        </MediaSelectorSheet>
                     </div>
                </div>

                <FormField control={form.control} name="rules" render={({ field }) => ( <FormItem><FormLabel>Rules & Regulations</FormLabel><FormControl><Textarea placeholder="e.g., 1. Be respectful. 2. No spam..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                
                 <FormField
                    control={form.control}
                    name="privacy"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Privacy</FormLabel>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 gap-4">
                            <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="public" className="sr-only" />
                                <Globe className="mb-3 h-6 w-6" />
                                Public
                                <span className="text-xs text-muted-foreground text-center mt-1">Anyone can join</span>
                            </Label>
                             <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="private" className="sr-only" />
                                <Lock className="mb-3 h-6 w-6" />
                                Private
                                 <span className="text-xs text-muted-foreground text-center mt-1">Members must request to join</span>
                            </Label>
                             <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="invite-only" className="sr-only" />
                                <UserPlus className="mb-3 h-6 w-6" />
                                Invite-only
                                 <span className="text-xs text-muted-foreground text-center mt-1">Only invited members can join</span>
                            </Label>
                        </RadioGroup>
                         <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
