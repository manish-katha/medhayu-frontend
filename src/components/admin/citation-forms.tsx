
'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { createCitationCategory, deleteCitationCategory } from '@/actions/citation.actions';
import type { CitationCategory, Quote, QuoteCategory } from '@/types';
import { createQuote } from '@/actions/quote.actions';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save } from 'lucide-react';


function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function CreateCitationCategoryDialog({ children, onCategoryCreated }: { children: React.ReactNode; onCategoryCreated?: () => void; }) {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createCitationCategory, null);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: "Category created." });
            setOpen(false);
            formRef.current?.reset();
            onCategoryCreated?.();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Error", description: state.error });
        }
    }, [state, toast, onCategoryCreated]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Citation Collection</DialogTitle>
            <DialogDescription>Add a new collection to group your citations.</DialogDescription>
            </DialogHeader>
            <form ref={formRef} action={formAction} className="space-y-4">
            <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input id="name" name="name" placeholder="e.g., Charaka Samhita" />
                {state?.fieldErrors?.name && <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <SubmitButton>Create Collection</SubmitButton>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
}


export function CollectionActions({ category, onActionComplete }: { category: CitationCategory, onActionComplete: () => void }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        const result = await deleteCitationCategory(category.id);
        if (result.success) {
            toast({ title: 'Collection Deleted' });
            onActionComplete();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename Collection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Collection
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Placeholder for Bulk Importer
export function BulkCitationImporterDialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Import Citations</DialogTitle>
                    <DialogDescription>
                        This feature is coming soon. You will be able to upload CSV files to import many citations at once.
                    </DialogDescription>
                </DialogHeader>
                 <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface CreateQuoteDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onQuoteCreated: (newQuote?: Quote) => void;
  initialQuote?: string;
  categories: QuoteCategory[];
}


function QuoteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Save Quote
    </Button>
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
            <QuoteSubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
