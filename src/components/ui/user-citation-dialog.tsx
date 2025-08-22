
'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handleSaveUserCitation } from '@/app/articles/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Transliterate } from '@/components/transliteration-provider';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save to My Notes
    </Button>
  );
}

export function UserCitationDialog({
  open,
  onOpenChange,
  sanskritText,
  source
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sanskritText: string;
  source: { name: string; location: string };
}) {
  const [state, formAction] = useActionState(handleSaveUserCitation, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Success!', description: state.message });
      onOpenChange(false);
      formRef.current?.reset();
    }
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
    }
  }, [state, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Citation to Notes</DialogTitle>
          <DialogDescription>
            This citation will be saved to your personal "User-Saved Notes" collection.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4">
            <div className="space-y-1">
                <Label>Selected Text</Label>
                <div className="p-2 border rounded-md bg-muted text-muted-foreground">
                    <Transliterate>{sanskritText}</Transliterate>
                </div>
                <input type="hidden" name="sanskrit" value={sanskritText} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" name="source" required defaultValue={source.name} />
                    {state?.fieldErrors?.source && <p className="text-sm text-destructive mt-1">{state.fieldErrors.source[0]}</p>}
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required defaultValue={source.location} />
                    {state?.fieldErrors?.location && <p className="text-sm text-destructive mt-1">{state.fieldErrors.location[0]}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="translation">Your Translation (Optional)</Label>
                <Textarea id="translation" name="translation" rows={3} />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input id="keywords" name="keywords" placeholder="e.g., dharma, karma, atman" />
            </div>

            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
