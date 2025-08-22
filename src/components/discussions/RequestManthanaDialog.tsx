
'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { manthanaRequestSchema, type ManthanaRequestValues } from '@/types/discussion';
import { requestManthana } from '@/actions/discussion.actions';
import { useToast } from '@/hooks/use-toast';
import type { Editor } from '@tiptap/react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';

interface RequestManthanaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discussionId: string;
  initialPurvapaksha?: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Start Debate
        </Button>
    );
}

const RequestManthanaDialog: React.FC<RequestManthanaDialogProps> = ({ open, onOpenChange, discussionId, initialPurvapaksha = '' }) => {
  const { toast } = useToast();
  const [state, formAction] = useActionState(requestManthana, null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [content, setContent] = useState(initialPurvapaksha);

  useEffect(() => {
    // When the dialog opens with initial text, update the state
    if (open && initialPurvapaksha) {
        setContent(initialPurvapaksha);
        editor?.commands.setContent(initialPurvapaksha);
    }
  }, [open, initialPurvapaksha, editor]);


  const form = useForm<ManthanaRequestValues>({
    resolver: zodResolver(manthanaRequestSchema),
    defaultValues: {
      discussionId: discussionId,
      topic: '',
      purvapaksha: initialPurvapaksha,
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Debate Started!", description: "The Manthana thread has been created." });
      onOpenChange(false);
      form.reset();
      setContent('');
      editor?.commands.clearContent();
    }
    if (state?.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast, onOpenChange, form, editor]);
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setContent('');
      editor?.commands.clearContent();
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Manthana (Debate)</DialogTitle>
          <DialogDescription>
            Initiate a scholarly debate by presenting a thesis (Purvapaksha) for others to respond to.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4 py-4">
            <input type="hidden" name="discussionId" value={discussionId} />
            <input type="hidden" name="purvapaksha" value={content} />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debate Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The true nature of Agni in metabolic disorders" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <FormLabel>Your Argument (Purvapaksha)</FormLabel>
                <div 
                    className="border rounded-md min-h-[150px] flex flex-col cursor-text"
                    onClick={() => editor?.commands.focus()}
                >
                    {editor && <EditorToolbar editor={editor} />}
                     <div className="p-2 flex-grow">
                        <RichTextEditor
                            id="purvapaksha-editor"
                            content={content}
                            onChange={setContent}
                            setEditorInstance={(id, instance) => setEditor(instance)}
                            placeholder="Clearly state your initial argument or perspective."
                        />
                    </div>
                </div>
                {state?.fieldErrors?.purvapaksha && <p className="text-sm font-medium text-destructive">{state.fieldErrors.purvapaksha[0]}</p>}
            </FormItem>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestManthanaDialog;
