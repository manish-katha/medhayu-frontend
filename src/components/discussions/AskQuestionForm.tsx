
'use client';

import React, { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionFormSchema, type QuestionFormValues } from '@/types/discussion';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { askQuestion } from '@/actions/discussion.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Send, XIcon } from 'lucide-react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import type { Editor } from '@tiptap/react';
import { Badge } from '../ui/badge';

const categories = ["BAMS/MD Practitioners", "Teachers", "Students", "Enthusiasts"];

interface AskQuestionFormProps {
    onSuccess: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="ml-auto" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
            Post Your Question
        </Button>
    )
}


export default function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(askQuestion, null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
      category: categories[0],
      type: 'general',
    },
  });

  useEffect(() => {
    if (state?.success && state.newQuestionId) {
      toast({ title: 'Question Asked!', description: 'Your question has been posted to the community.' });
      onSuccess();
      form.reset();
      setContent('');
      editor?.commands.clearContent();
    }
    if (state?.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, router, toast, onSuccess, form, editor]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !form.getValues('tags').includes(newTag)) {
        form.setValue('tags', [...form.getValues('tags'), newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = [...form.getValues('tags')];
    currentTags.splice(index, 1);
    form.setValue('tags', currentTags);
  };
  
  return (
    <>
    <DialogHeader>
        <DialogTitle>Ask the Community</DialogTitle>
        <DialogDescription>Post your question to get insights from fellow scholars and practitioners.</DialogDescription>
    </DialogHeader>
    <div className="max-h-[70vh] overflow-y-auto pr-6 pl-2 -mr-6 -ml-2 py-4">
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="tags" value={JSON.stringify(form.getValues('tags'))} />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input placeholder="What is the role of Agni in managing Amavata?" {...field} />
              </FormControl>
              <FormDescription>Be specific and imagine you’re asking a question to another person.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Body</FormLabel>
            <div 
            className="border rounded-md min-h-[200px] flex flex-col cursor-text"
            onClick={() => editor?.commands.focus()}
            >
            {editor && <EditorToolbar editor={editor} />}
            <FormControl>
                <RichTextEditor
                    id="question-body"
                    content={content}
                    onChange={setContent}
                    setEditorInstance={(id, instance) => setEditor(instance)}
                    removeEditorInstance={() => setEditor(null)}
                    placeholder="Include all the information someone would need to answer your question."
                />
            </FormControl>
            </div>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Knowledge Tags</FormLabel>
              <FormControl>
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch('tags').map((tag, index) => (
                      <Badge key={tag + index} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onClick={() => handleRemoveTag(index)}
                        >
                          <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter..."
                  />
                </div>
              </FormControl>
              <FormDescription>Add up to 5 tags to describe what your question is about.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2" name={field.name}>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="general" /></FormControl><FormLabel className="font-normal">General Question</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="debate" /></FormControl><FormLabel className="font-normal">Scholarly Debate</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
        </div>
        <DialogFooter className="sticky bottom-0 bg-background py-4 -mx-6 px-6 border-t">
            <SubmitButton />
        </DialogFooter>
      </form>
    </Form>
    </div>
    </>
  );
}
