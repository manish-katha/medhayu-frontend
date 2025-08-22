
'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Quote, QuoteCategory } from '@/types/quote';
import { createQuote } from '@/actions/quote.actions';
import { createBookCategory as createQuoteCategory } from '@/actions/book.actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, PlusCircle } from 'lucide-react';

interface CreateQuoteDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onQuoteCreated: (newQuote?: Quote) => void;
  initialQuote?: string;
  categories: QuoteCategory[];
}

function SubmitButton({ children = "Save Quote" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}

export function CreateQuoteCategoryDialog({ children, onCategoryCreated }: { children: React.ReactNode; onCategoryCreated?: () => void; }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createQuoteCategory, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
        toast({ title: "Success!", description: "Category created." });
        setOpen(false);
        formRef.current?.reset();
        onCategoryCreated?.();
    }
    if (state?.error && !state.fieldErrors) {
        toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  }, [state, toast, onCategoryCreated]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quote Category</DialogTitle>
          <DialogDescription>Add a new category to group your quotes.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" placeholder="e.g., Upanishads" />
            {state?.fieldErrors?.name && <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <SubmitButton>Create Category</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function CreateQuoteDialog({
  open,
  onOpenChange,
  onQuoteCreated,
  initialQuote = '',
  categories,
}: CreateQuoteDialogProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createQuote, null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: state.message });
      onQuoteCreated(state.data);
      onOpenChange(false);
    }
    if (state?.errors) {
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: 'Please check the form for errors.',
      });
    }
  }, [state, toast, onOpenChange, onQuoteCreated]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
          <DialogDescription>Save this text as a reusable quote for future reference.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote">Quote Text</Label>
            <Textarea id="quote" name="quote" defaultValue={initialQuote} rows={4} />
            {state?.errors?.quote && <p className="text-sm text-destructive mt-1">{state.errors.quote[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" placeholder="e.g., Charaka" />
             {state?.errors?.author && <p className="text-sm text-destructive mt-1">{state.errors.author[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="source">Source (Optional)</Label>
            <Input id="source" name="source" placeholder="e.g., Charaka Samhita, Sutrasthana 1.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" required>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {state?.errors?.categoryId && <p className="text-sm text-destructive mt-1">{state.errors.categoryId[0]}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <SubmitButton>Save Quote</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
