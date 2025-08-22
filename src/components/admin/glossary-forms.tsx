
'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import type { GlossaryCategory, GlossaryTerm } from '@/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Simplified schema for form actions
const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  scope: z.enum(['global', 'local']),
  colorTheme: z.enum(['saffron', 'blue', 'green', 'gray']),
});

const termFormSchema = z.object({
    term: z.string().min(1, 'Term is required'),
    aliases: z.array(z.object({ value: z.string() })).optional(),
    definition: z.string().min(1, 'Definition is required'),
    categoryId: z.string().min(1, 'Category is required'),
});

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {children}
        </Button>
    )
}

export function CreateCategoryDialog({ children, onCategoryCreated }: { children: React.ReactNode, onCategoryCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: { name: '', scope: 'local', colorTheme: 'gray' },
    });
    
    const onSubmit = (values: z.infer<typeof categoryFormSchema>) => {
        console.log('New category:', values);
        toast({ title: 'Category Created!' });
        onCategoryCreated?.();
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Glossary Category</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="scope" render={({ field }) => (<FormItem><FormLabel>Scope</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="global">Global</SelectItem><SelectItem value="local">Local (Book-specific)</SelectItem></SelectContent></Select></FormItem>)} />
                        <FormField control={form.control} name="colorTheme" render={({ field }) => (<FormItem><FormLabel>Color Theme</FormLabel><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-2">
                          {['saffron', 'blue', 'green', 'gray'].map(color => (
                            <FormItem key={color}>
                              <FormControl>
                                <RadioGroupItem value={color} className="sr-only" />
                              </FormControl>
                              <Label className={cn("h-8 w-8 rounded-full block cursor-pointer", `bg-${color === 'saffron' ? 'primary' : color}`, field.value === color && 'ring-2 ring-ring')}></Label>
                            </FormItem>
                          ))}
                        </RadioGroup></FormItem>)} />

                        <DialogFooter>
                            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Category</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export function CreateTermDialog({ children, categories, onTermCreated }: { children: React.ReactNode, categories: GlossaryCategory[], onTermCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof termFormSchema>>({
        resolver: zodResolver(termFormSchema),
        defaultValues: { term: '', aliases: [], definition: '', categoryId: '' },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "aliases",
    });

    const onSubmit = (values: z.infer<typeof termFormSchema>) => {
        console.log('New term:', values);
        toast({ title: 'Term Created!' });
        onTermCreated?.();
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Create New Glossary Term</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="term" render={({ field }) => (<FormItem><FormLabel>Term</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="definition" render={({ field }) => (<FormItem><FormLabel>Definition</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div>
                            <Label>Aliases (Optional)</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2 mt-1">
                                    <FormField control={form.control} name={`aliases.${index}.value`} render={({field}) => (<FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => remove(index)}><Trash2 size={16}/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                                <Plus size={16} className="mr-2" />Add Alias
                            </Button>
                        </div>
                        <FormField control={form.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                         <DialogFooter>
                            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Term</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
