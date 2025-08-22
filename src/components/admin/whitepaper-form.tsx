
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import type { StandaloneArticleCategory, UserProfile, Citation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft, UserPlus, X, BookOpen, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import type { Editor } from '@tiptap/react';
import { getDiscoverableUsers } from '@/services/user.service';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import dynamic from 'next/dynamic';
import { getCitationDetails } from '@/services/citation.service';

const DynamicRichTextEditor = dynamic(() => import('./rich-text-editor'), {
    ssr: false,
    loading: () => <div className="border rounded-md min-h-[150px] animate-pulse bg-muted"></div>
});

const EditorToolbar = dynamic(() => import('./editor/toolbar').then(mod => mod.EditorToolbar), {
    ssr: false
});

function SubmitButton({ type }: { type: 'whitepaper' | 'abstract' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Create {type === 'whitepaper' ? 'Whitepaper' : 'Abstract'}
    </Button>
  );
}

const AuthorSelector = ({ value, onChange }: { value: UserProfile[], onChange: (authors: UserProfile[]) => void }) => {
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [open, setOpen] = useState(false);
    
    useEffect(() => {
        getDiscoverableUsers().then(setAllUsers);
    }, []);

    const handleSelect = (user: UserProfile) => {
        if (!value.find(a => a.email === user.email)) {
            onChange([...value, user]);
        }
        setOpen(false);
    }
    
    const handleRemove = (email: string) => {
        onChange(value.filter(a => a.email !== email));
    }

    return (
        <div className="space-y-2">
            <Label>Author(s)</Label>
            <div className="p-2 border rounded-md min-h-12 flex flex-wrap gap-2 items-center">
                {value.map(author => (
                    <Badge key={author.email} variant="outline" className="p-1 pl-2 gap-1">
                        <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={author.avatarUrl} alt={author.name} />
                            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {author.name}
                         <button onClick={() => handleRemove(author.email)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" /> Add Author
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandList>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                    {allUsers.map(user => (
                                        <CommandItem key={user.email} onSelect={() => handleSelect(user)}>
                                            {user.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

const RichTextField = ({ name, placeholder, setFormValue, initialValue }: { name: string, placeholder: string, setFormValue: (name: string, value: string) => void, initialValue: string }) => {
    const [editor, setEditor] = useState<Editor | null>(null);
    return (
        <div className="border rounded-md min-h-[150px]">
            {editor && <EditorToolbar editor={editor} />}
            <div className="p-2">
                 <DynamicRichTextEditor
                    id={name}
                    content={initialValue || ''}
                    onChange={(val) => setFormValue(name, val)}
                    setEditorInstance={(id, instance) => setEditor(instance)}
                    removeEditorInstance={() => setEditor(null)}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

const ReferenceList = ({ referenceIds }: { referenceIds: string[] }) => {
    const [references, setReferences] = useState<Citation[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            const details = await Promise.all(
                referenceIds.map(id => getCitationDetails(id))
            );
            setReferences(details.filter(Boolean) as Citation[]);
        };
        fetchDetails();
    }, [referenceIds]);

    if (references.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No citations used yet.</p>;
    }

    return (
        <ul className="list-decimal list-inside space-y-2">
            {references.map(ref => (
                <li key={ref.refId} className="text-sm">
                    {ref.author || 'Author Unknown'}. ({ref.source}). "{ref.sanskrit}". Location: {ref.location}
                </li>
            ))}
        </ul>
    );
};


interface WhitepaperFormProps {
  categories: StandaloneArticleCategory[];
  formAction: (payload: FormData) => void;
  state: any;
  type: 'whitepaper' | 'abstract';
}

export function WhitepaperForm({ categories, formAction, state, type }: WhitepaperFormProps) {
  const title = type === 'whitepaper' ? 'New Whitepaper' : 'New Abstract';
  const description = type === 'whitepaper'
    ? 'Create a detailed whitepaper. You can fill in the key details here.'
    : 'Create a new abstract. You can fill in the key details here.';
    
  const [formData, setFormData] = useState<Record<string, any>>({
    authors: [],
    references: '',
  });

  const setFormValue = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const referenceIds = useMemo(() => {
    const allContent = Object.values(formData).join('');
    const matches = allContent.match(/data-ref-id="([^"]+)"/g) || [];
    const ids = matches.map(match => match.slice(13, -1));
    return [...new Set(ids)];
  }, [formData]);


  const sections = [
      { id: 'introduction', label: '4. Introduction', placeholder: 'Background of the topic, relevance, purpose...' },
      { id: 'problemStatement', label: '5. Problem Statement / Current Landscape', placeholder: 'In-depth analysis of the existing problem...' },
      { id: 'proposedSolution', label: '6. Proposed Solution / Approach', placeholder: 'Theoretical framework, methodologies, case studies...' },
      { id: 'classicalFramework', label: '7. Classical Framework (ESSENTIAL for Ayurveda)', placeholder: 'Quote original shlokas (with transliteration and meaning)...' },
      { id: 'modernContext', label: '8. Modern Context or Research Basis', placeholder: 'Any modern scientific backing, recent studies, or epidemiological data...' },
      { id: 'implementationStrategy', label: '9. Implementation Strategy / Methodology', placeholder: 'Explain how your solution is implemented...' },
      { id: 'observations', label: '10. Observations / Results / Case Studies', placeholder: 'Include tables, case snapshots, or pilot project outcomes...' },
      { id: 'discussion', label: '11. Discussion', placeholder: 'Interpret results with both Ayurveda and modern frameworks...' },
      { id: 'challenges', label: '12. Challenges & Limitations', placeholder: 'Be transparent about practical concerns, risks, etc...' },
      { id: 'conclusion', label: '13. Conclusion', placeholder: 'Restate the problem and key insights...' },
      { id: 'appendices', label: '15. Appendices (Optional)', placeholder: 'Supplementary data, glossary of terms...' },
  ];

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                <Link href="/medhayu/articles"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles</Link>
            </Button>
        </div>
        <Card>
            <form action={formAction}>
              <input type="hidden" name="type" value={type} />
              {Object.entries(formData).map(([key, value]) => {
                  return <input key={key} type="hidden" name={key} value={typeof value === 'object' ? JSON.stringify(value) : value} />
              })}
              
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={['title-page', 'summary']} className="w-full">
                  
                  <AccordionItem value="title-page">
                    <AccordionTrigger>1. Title Page</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title*</Label>
                            <Input id="title" name="title" required />
                            {state?.fieldErrors?.title && <p className="text-sm text-destructive mt-1">{state.fieldErrors.title[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input id="subtitle" name="subtitle" />
                        </div>
                        <AuthorSelector value={formData.authors} onChange={(val) => setFormValue('authors', val)} />
                         <div className="space-y-2">
                            <Label htmlFor="categoryId">Category*</Label>
                            <Select name="categoryId" required>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            {state?.fieldErrors?.categoryId && <p className="text-sm text-destructive mt-1">{state.fieldErrors.categoryId[0]}</p>}
                        </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="summary">
                    <AccordionTrigger>2. Executive Summary / Abstract*</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <RichTextField name="content" placeholder="Summary of the entire paper..." setFormValue={setFormValue} initialValue={formData.content || ''} />
                       {state?.fieldErrors?.content && <p className="text-sm text-destructive mt-1">{state.fieldErrors.content[0]}</p>}
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="toc">
                        <AccordionTrigger>3. Table of Contents</AccordionTrigger>
                        <AccordionContent className="pt-2 text-sm text-muted-foreground">The Table of Contents will be auto-generated from headings in your content.</AccordionContent>
                    </AccordionItem>

                  {sections.map(section => (
                       <AccordionItem key={section.id} value={section.id}>
                         <AccordionTrigger>{section.label}</AccordionTrigger>
                         <AccordionContent className="pt-2">
                            <RichTextField name={section.id} placeholder={section.placeholder} setFormValue={setFormValue} initialValue={formData[section.id] || ''} />
                         </AccordionContent>
                       </AccordionItem>
                  ))}
                  
                   <AccordionItem value="references">
                        <AccordionTrigger>14. References / Bibliography</AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-4">
                           <Card className="bg-muted/50">
                               <CardHeader>
                                   <CardTitle className="text-base flex items-center gap-2">
                                       <BookOpen className="h-5 w-5 text-muted-foreground" />
                                       Auto-Generated References
                                   </CardTitle>
                                   <CardDescription>This list is automatically compiled from citations (e.g., [[CS.Su.1]]) used in your document.</CardDescription>
                               </CardHeader>
                               <CardContent>
                                   <ReferenceList referenceIds={referenceIds} />
                               </CardContent>
                           </Card>
                           <RichTextField name="references" placeholder="Add manual bibliography entries here..." setFormValue={setFormValue} initialValue={formData.references || ''} />
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-end">
                <SubmitButton type={type} />
              </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
