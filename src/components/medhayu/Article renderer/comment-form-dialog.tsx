
'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handleAddComment } from '@/app/articles/actions';
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
      Submit Comment
    </Button>
  );
}

export function CommentFormDialog({
  open,
  onOpenChange,
  targetText,
  articleInfo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetText: string;
  articleInfo: { bookId: string; chapterId: string; verse: string };
}) {
  const [state, formAction] = useActionState(handleAddComment, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Success!', description: 'Your comment has been posted.' });
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
          <DialogTitle>Add a Comment</DialogTitle>
          <DialogDescription>
            Share your thoughts on the selected text.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4">
            <input type="hidden" name="bookId" value={articleInfo.bookId} />
            <input type="hidden" name="chapterId" value={articleInfo.chapterId} />
            <input type="hidden" name="verse" value={articleInfo.verse} />
            <input type="hidden" name="targetText" value={targetText} />
            
            <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                <Transliterate>{targetText}</Transliterate>
            </blockquote>

            <div>
              <Label htmlFor="body">Your Comment</Label>
              <Textarea id="body" name="body" required rows={4} />
              {state?.fieldErrors?.body && <p className="text-sm text-destructive mt-1">{state.fieldErrors.body[0]}</p>}
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
