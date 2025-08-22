

'use client';

import { useActionState, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { runGlossaryParser, importGlossaryData } from '@/actions/glossary.actions';
import { getGlossaryData } from '@/services/glossary.service';
import type { GlossaryCategory } from '@/types';
import { CreateCategoryDialog } from '@/components/admin/glossary-forms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Sparkles, Library, Trash2, Pencil, Save, X, Plus, AlertCircle, Combine, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function ParserSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Parsing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Preview Terms
        </>
      )}
    </Button>
  );
}

function ImporterSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Library className="mr-2 h-4 w-4" /> Import to Library</>}
    </Button>
  );
}

function TermEditor({ term, onUpdate, onDelete, onSelect, isSelected }: {
    term: any;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
    isSelected: boolean;
}) {
    return (
        <Card className={cn("bg-background", isSelected && "border-primary ring-1 ring-primary")}>
            <CardContent className="p-3">
                <div className="flex items-start gap-4">
                    <Checkbox
                        id={`select-${term.id}`}
                        checked={isSelected}
                        onCheckedChange={() => onSelect(term.id)}
                        className="mt-1"
                        aria-label={`Select term ${term.term}`}
                    />
                    <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`term-${term.id}`} className="text-xs">Term</Label>
                                <Input
                                    id={`term-${term.id}`}
                                    value={term.term || ''}
                                    onChange={(e) => onUpdate(term.id, 'term', e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                             <div>
                                <Label htmlFor={`transliteration-${term.id}`} className="text-xs">Transliteration</Label>
                                <Input
                                    id={`transliteration-${term.id}`}
                                    value={term.transliteration || ''}
                                    onChange={(e) => onUpdate(term.id, 'transliteration', e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor={`definition-${term.id}`} className="text-xs">Definition</Label>
                            <Textarea
                                id={`definition-${term.id}`}
                                value={term.definition || ''}
                                onChange={(e) => onUpdate(term.id, 'definition', e.target.value)}
                                className="text-sm"
                                rows={3}
                            />
                        </div>
                    </div>
                     <Button size="icon" variant="ghost" onClick={() => onDelete(term.id)} title="Delete Term" className="shrink-0 mt-4">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ParsedContentEditor({ data, onDataChange, categories, creatorState }: { 
    data: any, 
    onDataChange: (fn: (d: any) => any) => void,
    categories: GlossaryCategory[],
    creatorState: any 
}) {
    const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 100;

    const totalPages = Math.ceil((data.terms?.length || 0) / ITEMS_PER_PAGE);

    const paginatedTerms = useMemo(() => {
        if (!data?.terms) return [];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.terms.slice(startIndex, endIndex);
    }, [data.terms, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [data.terms]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleStartOver = () => {
        onDataChange(() => null);
        setIsClearConfirmOpen(false);
    };

    const handleSelectTerm = useCallback((id: string) => {
        setSelectedTerms(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    }, []);

    const handleUpdateTerm = useCallback((id: string, field: string, value: any) => {
        onDataChange((currentData: any) => {
            if (!currentData || !currentData.terms) return currentData;
            const newTerms = currentData.terms.map((t: any) => 
                t.id === id ? { ...t, [field]: value } : t
            );
            return { ...currentData, terms: newTerms };
        });
    }, [onDataChange]);

    const handleDeleteTerm = useCallback((id: string) => {
        onDataChange((currentData: any) => {
            if (!currentData || !currentData.terms) return currentData;
            const newTerms = currentData.terms.filter((t: any) => t.id !== id);
            return { ...currentData, terms: newTerms };
        });
    }, [onDataChange]);
    
    const handleDeleteSelected = () => {
        onDataChange((currentData: any) => {
            if (!currentData || !currentData.terms || selectedTerms.size === 0) return currentData;
            const newTerms = currentData.terms.filter((t: any) => !selectedTerms.has(t.id));
            return { ...currentData, terms: newTerms };
        });
        setSelectedTerms(new Set());
    };

    const handleMerge = () => {
        onDataChange((currentData: any) => {
            if (!currentData || !currentData.terms || selectedTerms.size < 2) return currentData;
            
            const termsToMerge: any[] = [];
            const otherTerms: any[] = [];

            currentData.terms.forEach((t: any) => {
                if (selectedTerms.has(t.id)) {
                    termsToMerge.push(t);
                } else {
                    otherTerms.push(t);
                }
            });

            if (termsToMerge.length < 2) return currentData;

            const firstTerm = termsToMerge[0];
            const mergedDefinition = termsToMerge.map(t => t.definition).join('\n\n---\n\n');
            
            const newTerm = {
                ...firstTerm,
                id: crypto.randomUUID(),
                definition: mergedDefinition,
            };

            const insertIndex = currentData.terms.findIndex((t: any) => t.id === firstTerm.id);
            const newTermsList = [...otherTerms];
            newTermsList.splice(insertIndex >= 0 ? insertIndex : 0, 0, newTerm);
            
            return { ...currentData, terms: newTermsList };
        });
        setSelectedTerms(new Set());
    };
    
    const handleSplitSelected = () => {
        if (selectedTerms.size !== 1) {
            toast({ variant: 'destructive', title: 'Select exactly one segment to split.' });
            return;
        }

        const segmentIdToSplit = Array.from(selectedTerms)[0];

        onDataChange((currentData: any) => {
            let chapterIdOfSplit: string | null = null;
            let segmentToSplit: any = null;
            let originalIndex = -1;
            
            currentData.terms.forEach((c: any) => {
                const foundIndex = (c.segments || []).findIndex((s: any) => s.id === segmentIdToSplit);
                if (foundIndex !== -1) {
                    segmentToSplit = c.segments[foundIndex];
                    chapterIdOfSplit = c.id;
                    originalIndex = foundIndex;
                }
            });

            if (!segmentToSplit || chapterIdOfSplit === null || originalIndex === -1) return currentData;

            const lines = segmentToSplit.definition.split('\n').filter((l: string) => l.trim() !== '');
            if (lines.length <= 1) {
                toast({ title: 'Info', description: 'This segment cannot be split further.' });
                return currentData;
            }
            
            const newSegments = lines.map((line: string) => ({
                ...segmentToSplit,
                id: crypto.randomUUID(),
                definition: line,
            }));
            
            const newChapters = currentData.chapters.map((c: any) => {
                if (c.id !== chapterIdOfSplit) return c;
                
                const segments = [...c.segments];
                segments.splice(originalIndex, 1, ...newSegments);
                
                return { ...c, segments };
            });

            return { ...currentData, chapters: newChapters };
        });
        setSelectedTerms(new Set());
    };
    
    const dataToSubmit = data.terms || [];

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        );
    };

    return (
        <form action={importGlossaryData} className="space-y-6">
             <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will discard all parsed terms and your edits. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStartOver} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Yes, Discard All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <input type="hidden" name="terms" value={JSON.stringify(dataToSubmit)} />
            
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-medium">Parsed Terms ({data.terms?.length || 0})</h3>
                    <p className="text-sm text-muted-foreground">Review and edit the extracted terms before importing.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category-select">Import Into Category *</Label>
                    <div className="flex items-center gap-2">
                         <Select name="categoryId" required defaultValue="uncategorized">
                            <SelectTrigger id="category-select" className="w-full sm:w-[250px]">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <CreateCategoryDialog>
                            <Button type="button" variant="outline" size="icon" className="flex-shrink-0" title="Add new category">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CreateCategoryDialog>
                    </div>
                    {creatorState?.fieldErrors?.categoryId && (
                        <p className="text-sm text-destructive">{creatorState.fieldErrors.categoryId[0]}</p>
                    )}
                </div>
            </div>
            
            {data.errors && data.errors.length > 0 && (
                 <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                         <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                        <CardTitle className="text-base text-yellow-800 dark:text-yellow-200">Parsing Warnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {data.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mx-4 px-4 py-2 border-b mb-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h4 className="font-semibold">{selectedTerms.size} selected</h4>
                        {selectedTerms.size > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={handleMerge}>
                                <Combine className="mr-2 h-4 w-4" /> Merge
                            </Button>
                        )}
                        {selectedTerms.size > 0 && (
                            <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteSelected}>
                                <Trash className="mr-2 h-4 w-4" /> Delete Selected
                            </Button>
                        )}
                    </div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setIsClearConfirmOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                </div>
            </div>

            <PaginationControls />

            <div className="space-y-2">
                {paginatedTerms.map((term: any) => (
                    <TermEditor 
                        key={term.id}
                        term={term}
                        onUpdate={handleUpdateTerm}
                        onDelete={handleDeleteTerm}
                        onSelect={handleSelectTerm}
                        isSelected={selectedTerms.has(term.id)}
                    />
                ))}
            </div>

            <PaginationControls />

            <div className="flex justify-end pt-4 border-t">
                 <ImporterSubmitButton />
            </div>
        </form>
    );
}


export default function BulkImportGlossaryPage() {
    const [categories, setCategories] = useState<GlossaryCategory[]>([]);
    const [activeTab, setActiveTab] = useState('paste');
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [parsedData, setParsedData] = useState<any>(null);
    
    const [parserState, runParserAction] = useActionState(runGlossaryParser, null);
    const [creatorState, importDataAction] = useActionState(importGlossaryData, null);
    
    useEffect(() => {
        getGlossaryData().then(setCategories);
    }, []);

    useEffect(() => {
        if (parserState?.success) {
            toast({
                title: '✅ Parsing Complete!',
                description: `Found ${parserState.data.terms.length} terms. Please review them below.`,
            });
            setParsedData(parserState.data);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
        if (parserState?.error && !parserState?.fieldErrors) {
             toast({ variant: 'destructive', title: 'Parsing Error', description: parserState.error });
        }
    }, [parserState, toast]);
    
    useEffect(() => {
        if (creatorState?.success) {
            toast({ title: "Import Complete!", description: creatorState.message });
            setParsedData(null);
        }
        if (creatorState?.error) {
            toast({ variant: 'destructive', title: "Import Error", description: creatorState.error });
        }
    }, [creatorState, toast]);

    if (parsedData) {
        return (
            <div className="medhayu-module-container space-y-8">
                 <h1 className="text-3xl font-bold">Review and Import Glossary</h1>
                 <Card>
                    <CardHeader>
                        <CardTitle>2. Review and Finalize</CardTitle>
                        <CardDescription>Edit, merge, or remove terms, select the destination category, then import.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ParsedContentEditor 
                            data={parsedData}
                            onDataChange={setParsedData}
                            categories={categories}
                            creatorState={creatorState}
                        />
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div className="medhayu-module-container space-y-8">
            <h1 className="text-3xl font-bold">Bulk Import Glossary</h1>
            <Card>
                <CardHeader>
                    <CardTitle>1. Provide Glossary Data</CardTitle>
                    <CardDescription>Import terms by pasting text, using AI to parse dictionaries, or uploading a file.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={runParserAction}>
                        <input type="hidden" name="sourceType" value={activeTab} />
                        <Tabs defaultValue="paste" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                                <TabsTrigger value="ai"><Sparkles className="mr-2 h-4 w-4" /> AI Dictionary Parser</TabsTrigger>
                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                            </TabsList>
                            <TabsContent value="paste" className="pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paste_data">Terms Data (CSV or Term-Definition)</Label>
                                    <Textarea
                                        id="paste_data"
                                        name="paste_data"
                                        placeholder={"dharma,dharma,That which upholds or supports.\nātman,,Self or soul.\nBrahman The ultimate reality of the universe."}
                                        rows={10}
                                    />
                                    {parserState?.fieldErrors?.data && activeTab === 'paste' && (
                                        <p className="text-sm text-destructive">{parserState.fieldErrors.data[0]}</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="ai" className="pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ai_data">Structured Dictionary Text</Label>
                                    <Textarea
                                        id="ai_data"
                                        name="ai_data"
                                        placeholder={"अ, अकारः । आद्यस्वरवर्णः ।...\nअंशः, पुं, (अंश विभाजने...) विभाजनं ।..."}
                                        rows={10}
                                    />
                                    <p className="text-xs text-muted-foreground">Best for text from structured dictionaries like Monier-Williams.</p>
                                    {parserState?.fieldErrors?.data && activeTab === 'ai' && (
                                        <p className="text-sm text-destructive">{parserState.fieldErrors.data[0]}</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="upload" className="pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="file">Upload File (.csv, .json, .txt, .xml)</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".csv,.json,.txt,.xml,text/csv,application/json,text/plain,text/xml,application/xml"
                                    />
                                    {parserState?.fieldErrors?.file && activeTab === 'upload' && (
                                        <p className="text-sm text-destructive">{parserState.fieldErrors.file[0]}</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                        {parserState?.error && !parserState.fieldErrors && <p className="text-sm text-destructive mt-4">{parserState.error}</p>}
                        <div className="mt-6">
                            <ParserSubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
