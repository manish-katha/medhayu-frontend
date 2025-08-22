
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ManthanaThread, UserProfile, DebateEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addUttaraPaksha } from '@/actions/discussion.actions';
import { uttaraPakshaSchema, type UttaraPakshaFormValues } from '@/types/discussion';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import type { Editor } from '@tiptap/react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';

const ArgumentEntry = ({ entry }: { entry: DebateEntry }) => (
    <div className="bg-muted/50 p-4 rounded-lg">
        <div>
            <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: entry.content }}
            />
            <div className="flex items-center gap-2 mt-4 pt-2 border-t">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={entry.author.avatarUrl} alt={entry.author.name} />
                    <AvatarFallback>{entry.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{entry.author.name}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
            </div>
        </div>
    </div>
);

const DebateColumn = ({ title, children, className }: { title: React.ReactNode, children?: React.ReactNode, className?: string }) => (
    <div className={cn("space-y-4", className)}>
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        {children}
    </div>
);


const ArgumentSubmissionForm = ({ discussionId, threadId, onNewEntry }: { discussionId: string, threadId: string, onNewEntry: (entry: any) => void }) => {
    const { pending } = useFormStatus();
    const [editor, setEditor] = useState<Editor | null>(null);
    const [content, setContent] = useState('');
    const [state, formAction] = useActionState(addUttaraPaksha, null);
    
    const form = useForm<UttaraPakshaFormValues>({
        resolver: zodResolver(uttaraPakshaSchema),
        defaultValues: {
            discussionId,
            threadId,
            content: '',
            stance: 'uttarpaksha',
        }
    });

    useEffect(() => {
        if(state?.success && state.newEntry) {
            toast({ title: "Argument posted!" });
            setContent('');
            form.reset();
            editor?.commands.clearContent();
            onNewEntry(state.newEntry);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, editor, onNewEntry, form]);
    
    return (
         <form action={formAction} className="mt-4 space-y-4">
            <input type="hidden" name="discussionId" value={discussionId} />
            <input type="hidden" name="threadId" value={threadId} />
            <input type="hidden" name="content" value={content} />
            
            <div className="border rounded-md min-h-[150px]">
                {editor && <EditorToolbar editor={editor} />}
                <RichTextEditor
                    id={`uttara-${threadId}`}
                    content={content}
                    onChange={setContent}
                    setEditorInstance={(id, editor) => setEditor(editor)}
                    placeholder="Write your argument here..."
                />
            </div>

            <div>
                <Label>Stance</Label>
                 <Controller
                    name="stance"
                    control={form.control}
                    defaultValue="uttarpaksha"
                    render={({ field }) => (
                        <RadioGroup
                            name="stance"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4 mt-2"
                        >
                            <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer", field.value === 'purvapaksha' && "border-ayurveda-terracotta")}>
                                <RadioGroupItem value="purvapaksha" className="sr-only" />
                                Support Thesis (Purvapaksha)
                            </Label>
                            <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer", field.value === 'uttarpaksha' && "border-ayurveda-green")}>
                                <RadioGroupItem value="uttarpaksha" className="sr-only" />
                                Counter Argument (Uttarpaksha)
                            </Label>
                        </RadioGroup>
                    )}
                 />
                 {state?.fieldErrors?.stance && <p className="text-sm font-medium text-destructive mt-1">{state.fieldErrors.stance[0]}</p>}
            </div>
            
            <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                    Post Argument
                </Button>
            </div>
        </form>
    );
};


const ManthanaViewer = ({ thread: initialThread, discussionId }: { thread: ManthanaThread, discussionId: string }) => {
  const [thread, setThread] = useState(initialThread);

  const handleNewEntry = (newEntry: DebateEntry) => {
    setThread(prev => ({
        ...prev,
        uttarpaksha: [...prev.uttarpaksha, newEntry]
    }));
  };
  
  const purvapakshaEntry = thread.purvapaksha;
  const supportingArgs = thread.uttarpaksha.filter(e => e.stance === 'purvapaksha');
  const counterArgs = thread.uttarpaksha.filter(e => e.stance === 'uttarpaksha');

  return (
    <Card className="bg-card/50">
        <CardHeader>
            <CardTitle>{thread.topic}</CardTitle>
            <CardDescription>A scholarly debate based on Purvapaksha and Uttarpaksha.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col lg:w-1/2 space-y-4">
                    <DebateColumn title="Purvapaksha (Opening Thesis)" className="text-ayurveda-terracotta">
                        <ArgumentEntry entry={purvapakshaEntry} />
                    </DebateColumn>
                    {supportingArgs.length > 0 && (
                         <DebateColumn title="Supporting Arguments">
                            {supportingArgs.map(entry => <ArgumentEntry key={entry.id} entry={entry} />)}
                         </DebateColumn>
                    )}
                </div>

                <DebateColumn title="Uttarpaksha (Counter-arguments)" className="text-ayurveda-green lg:w-1/2">
                    {counterArgs.length > 0 ? (
                        counterArgs.map(entry => (
                            <ArgumentEntry key={entry.id} entry={entry} />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic p-4 text-center">No counter-arguments have been posted yet.</p>
                    )}
                </DebateColumn>
            </div>
            <Separator className="my-8" />
            <div>
                 <h3 className="font-semibold text-xl">Contribute to the Debate</h3>
                <ArgumentSubmissionForm discussionId={discussionId} threadId={thread.id} onNewEntry={handleNewEntry} />
            </div>
        </CardContent>
    </Card>
  );
};

export default ManthanaViewer;
