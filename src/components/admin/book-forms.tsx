
'use client';

import React, { useActionState, useEffect, useRef, useState, type ReactNode, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import dynamic from 'next/dynamic';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createBook, createChapter, createBookCategory, updateBookVisibility, updateBook, groupBooksIntoSeries, updateSeriesDescription } from '@/actions/book.actions';
import { getSeriesNames, getBookCategories } from '@/services/book.service';
import { Loader2, Plus, Camera, ImageIcon, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import {
    ALL_COMMENTARY_TYPES,
    COMMENTARY_TYPE_GROUPS,
    getTypeLabelById,
    SANSKRIT_TEXT_TYPE_GROUPS,
    SOURCE_TYPE_GROUPS,
    ALL_SOURCE_TYPES,
    getSanskritLabelById,
    getIastLabelById,
} from '@/types/sanskrit.types';
import type { CommentaryInfo, BookCategory, BookStructure, ContentBlock, BookContent, Circle, Editor, Book } from '@/types';
import { BOOK_SUBJECTS } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getMediaFiles } from '@/services/media.service';
import { MediaUploader } from './media-uploader';
import { Separator } from '../ui/separator';
import { Stepper, StepperItem, StepperLabel, StepperSeparator } from '@/components/ui/stepper';
import { Form } from '../ui/form';
import { EditorToolbar } from '@/components/admin/editor/toolbar';

const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor').then(mod => mod.RichTextEditor), {
    ssr: false,
    loading: () => <div className="min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 animate-pulse" />
});

const CreatableCombobox = dynamic(() => import('../ui/creatable-combobox').then(mod => mod.CreatableCombobox), {
    ssr: false,
    loading: () => <div className="h-10 w-full rounded-md border border-input bg-background animate-pulse" />
});


function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function CreateBookCategoryDialog({ children, onCategoryCreated }: { children: ReactNode; onCategoryCreated?: () => void; }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createBookCategory, null);
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
          <DialogTitle>Create New Book Category</DialogTitle>
          <DialogDescription>Add a new category to group your books.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" placeholder="e.g., Itihasa" />
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

function CheckboxGroup({ title, group, defaultValues = [] }: { title: string, group: { id: string, label: string }[], defaultValues?: string[] }) {
    const name = title === "Source Types" ? "sourceTypes" : "commentaryTypes";
    return (
        <div>
            <h4 className="font-medium mb-2">{title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                {group.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${name}-${item.id}`}
                            name={name}
                            value={item.id}
                            defaultChecked={(defaultValues || []).includes(item.id)}
                        />
                        <Label htmlFor={`${name}-${item.id}`} className="text-sm font-normal cursor-pointer">{item.label}</Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ImageSelector({ label, value, onValueChange, target }: { label: string, value: string, onValueChange: (url: string) => void, target: 'cover' | 'profile' }) {
    const [isMediaSheetOpen, setIsMediaSheetOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<string[]>([]);

    const fetchMedia = () => getMediaFiles().then(setMediaFiles);

    useEffect(() => {
        if (isMediaSheetOpen) {
           fetchMedia();
        }
    }, [isMediaSheetOpen]);

    const handleSelectImage = (url: string) => {
        onValueChange(url);
        setIsMediaSheetOpen(false);
    }

    const isCover = target === 'cover';

    return (
        <Sheet open={isMediaSheetOpen} onOpenChange={setIsMediaSheetOpen}>
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className={cn("relative rounded-md border bg-muted group", isCover ? "aspect-[16/9]" : "aspect-[4/6] w-48")}>
                    <Image src={value || 'https://placehold.co/800x400.png'} alt={`${label} preview`} fill className="object-cover rounded-md" data-ai-hint="book cover background" />
                    <SheetTrigger asChild>
                        <Button variant="secondary" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="mr-2 h-4 w-4" /> Change
                        </Button>
                    </SheetTrigger>
                </div>
            </div>
             <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Select {label}</SheetTitle>
                </SheetHeader>
                <div className="p-4 border-y">
                    <MediaUploader showCard={false} onUploadSuccess={fetchMedia} />
                </div>
                <ScrollArea className="flex-1 mt-4">
                     {mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 pr-6">
                            {mediaFiles.map((fileUrl) => (
                                <button key={fileUrl} className="relative aspect-square overflow-hidden rounded-md border group focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => handleSelectImage(fileUrl)}>
                                    <Image
                                        src={fileUrl}
                                        alt=""
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ImageIcon className="h-8 w-8 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No images in library.</p>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

const bookFormSteps = [
    { step: 1, label: 'Primary Details' },
    { step: 2, label: 'Visuals & Structure' },
    { step: 3, label: 'Publication Info' },
];

export function BookFormDialog({ trigger, categories: initialCategories, bookToEdit }: { trigger: ReactNode; categories: BookCategory[]; bookToEdit?: Book; }) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!bookToEdit;
  const [categories, setCategories] = useState(initialCategories);

  const action = isEditMode ? updateBook : createBook;
  const [state, formAction] = useActionState(action, null);

  const [coverUrl, setCoverUrl] = useState(bookToEdit?.coverUrl || 'https://placehold.co/800x400.png');
  const [profileUrl, setProfileUrl] = useState(bookToEdit?.profileUrl || 'https://placehold.co/400x600.png');
  const [description, setDescription] = useState(bookToEdit?.description || '');
  const [descriptionEditor, setDescriptionEditor] = useState<Editor | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [allSeriesNames, setAllSeriesNames] = useState<string[]>([]);
  const [volumeSeriesName, setVolumeSeriesName] = useState(bookToEdit?.volumeInfo?.seriesName || '');

  const { toast } = useToast();
  const router = useRouter();
  
  const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if(!isOpen) {
          setCurrentStep(1);
      }
  }

  useEffect(() => {
    if (state?.success) {
        toast({ title: 'Success!', description: isEditMode ? 'Book updated successfully.' : 'Book created successfully.' });
        handleOpenChange(false);
        router.refresh();
    } else if (state?.error) {
        toast({ variant: 'destructive', title: 'Error', description: state.error });
    }
  }, [state, toast, router, isEditMode]);
  

  useEffect(() => {
    if (open) {
        setCategories(initialCategories);
        getSeriesNames().then(setAllSeriesNames);
        setCoverUrl(bookToEdit?.coverUrl || 'https://placehold.co/800x400.png');
        setProfileUrl(bookToEdit?.profileUrl || 'https://placehold.co/400x600.png');
        setDescription(bookToEdit?.description || '');
        setVolumeSeriesName(bookToEdit?.volumeInfo?.seriesName || '');
        setCurrentStep(1);
    }
  }, [open, bookToEdit, initialCategories]);

  const handleCategoryCreated = useCallback(async () => {
    const freshCategories = await getBookCategories();
    setCategories(freshCategories);
  }, []);

  const allSourceTypes = Object.values(SOURCE_TYPE_GROUPS).flat();
  const allCommentaryTypes = Object.values(COMMENTARY_TYPE_GROUPS).flat();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Book Profile' : 'Create New Book'}</DialogTitle>
          <DialogDescription>
             Step {currentStep} of {bookFormSteps.length} - {bookFormSteps.find(s => s.step === currentStep)?.label}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isEditMode && <input type="hidden" name="id" value={bookToEdit.id} />}
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="coverUrl" value={coverUrl} />
          <input type="hidden" name="profileUrl" value={profileUrl} />
          <input type="hidden" name="volumeSeriesName" value={volumeSeriesName} />

           <div className="flex-1 overflow-y-auto -mr-6 pr-6 pb-6">
                <Stepper className="mb-8">
                    {bookFormSteps.map(({ step, label }) => (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center gap-1 text-center cursor-pointer" onClick={() => setCurrentStep(step)}>
                                <StepperItem isCompleted={currentStep > step} isActive={currentStep === step}>
                                    {step}
                                </StepperItem>
                                <StepperLabel>{label}</StepperLabel>
                            </div>
                            {step < bookFormSteps.length && <StepperSeparator />}
                        </React.Fragment>
                    ))}
                </Stepper>

                <div className="space-y-6">
                    <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        <Card>
                            <CardHeader><CardTitle>Primary Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Book Name</Label>
                                        <Input id="name" name="name" placeholder="e.g., The Upanishads" defaultValue={bookToEdit?.name ?? ''} />
                                        {state?.fieldErrors?.name && <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subtitle">Subtitle</Label>
                                        <Input id="subtitle" name="subtitle" placeholder="e.g., A New Translation" defaultValue={bookToEdit?.subtitle ?? ''} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description-editor">Book Description</Label>
                                    <div className="rounded-md border min-h-[150px]">
                                        {descriptionEditor && <EditorToolbar editor={descriptionEditor} />}
                                        <RichTextEditor
                                            id="description-editor"
                                            content={description}
                                            onChange={setDescription}
                                            setEditorInstance={(id, editor) => setDescriptionEditor(editor)}
                                            placeholder="A brief summary of the book..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryId">Category</Label>
                                        <div className="flex items-center gap-2">
                                        <Select name="categoryId" defaultValue={bookToEdit?.categoryId ?? ''}>
                                            <SelectTrigger id="categoryId">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <CreateBookCategoryDialog onCategoryCreated={handleCategoryCreated}>
                                            <Button type="button" variant="outline" size="icon" className="flex-shrink-0" title="Add new category">
                                            <Plus className="h-4 w-4" />
                                            </Button>
                                        </CreateBookCategoryDialog>
                                        </div>
                                        {state?.fieldErrors?.categoryId && <p className="text-sm text-destructive mt-1">{state.fieldErrors.categoryId[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject / Book Type</Label>
                                        <Select name="subject" defaultValue={bookToEdit?.subject ?? ''}>
                                            <SelectTrigger id="subject">
                                            <SelectValue placeholder="Select a subject type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                            {BOOK_SUBJECTS.map(subject => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                {subject.label}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                     <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                        <>
                            <Card>
                                <CardHeader><CardTitle>Visuals</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
                                    <ImageSelector label="Cover Image (16:9)" value={coverUrl} onValueChange={setCoverUrl} target="cover" />
                                    <ImageSelector label="Profile Image (4:6)" value={profileUrl} onValueChange={setProfileUrl} target="profile" />
                                </CardContent>
                            </Card>
                            <Card className="mt-6">
                                <CardHeader><CardTitle>Content Structure</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">Select all text types you expect to use. This will customize the editor to only show these options.</p>
                                    <CheckboxGroup title="Source Types" group={allSourceTypes} defaultValues={[]} />
                                    <CheckboxGroup title="Commentary Types" group={allCommentaryTypes} defaultValues={[]} />
                                </CardContent>
                            </Card>
                        </>
                    </div>
                     <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                         <Card>
                            <CardHeader><CardTitle>Publication Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="authorName">Author Name</Label>
                                        <Input id="authorName" name="author" placeholder="e.g., Vyasa" defaultValue={bookToEdit?.author ?? ''} />
                                    </div>
                                    <div>
                                        <Label htmlFor="publishedAt">Publication Date</Label>
                                        <Input id="publishedAt" name="publishedAt" type="date" defaultValue={''} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="publisher">Publisher Name</Label>
                                    <Input id="publisher" name="publisher" placeholder="e.g., Indic Press" defaultValue={bookToEdit?.publisher ?? ''} />
                                </div>
                                <div>
                                    <Label htmlFor="isbn">ISBN Number</Label>
                                    <Input id="isbn" name="isbn" placeholder="e.g., 978-3-16-148410-0" defaultValue={bookToEdit?.isbn ?? ''} />
                                </div>
                                <div>
                                    <Label htmlFor="designer">Cover Designer</Label>
                                    <Input id="designer" name="designer" placeholder="e.g., Jane Doe" defaultValue={bookToEdit?.designer ?? ''} />
                                </div>
                                </div>
                                <Separator className="my-6" />
                                <h4 className="font-semibold text-md">Volume Information (Optional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <Label htmlFor="volumeSeriesName">Series Name</Label>
                                        <CreatableCombobox
                                            options={allSeriesNames.map(name => ({ value: name, label: name }))}
                                            value={volumeSeriesName}
                                            onValueChange={setVolumeSeriesName}
                                            placeholder="Select or create a series..."
                                            searchPlaceholder="Search series..."
                                            emptyPlaceholder="No series found."
                                            createPlaceholder={(val) => `Create new series "${val}"`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="volumeNumber">Volume Number</Label>
                                        <Input id="volumeNumber" name="volumeNumber" type="number" placeholder="e.g., 3" defaultValue={bookToEdit?.volumeInfo?.volumeNumber ?? ''} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
          </div>

          <DialogFooter className="pt-4 mt-auto border-t flex-shrink-0">
             <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
             <div className="flex-1 flex justify-end gap-2">
                 {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                 )}
                  {currentStep < bookFormSteps.length ? (
                    <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <SubmitButton>
                        {isEditMode ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : <> <Plus className="mr-2 h-4 w-4" /> Create Book</>}
                    </SubmitButton>
                )}
             </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function CreateChapterDialog({ bookId, children, parentId, bookName }: { bookId: string; children: ReactNode; parentId?: string | number, bookName?: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createChapter, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
        toast({ title: "Success!", description: "Chapter created successfully." });
        setOpen(false);
        formRef.current?.reset();
        router.refresh();
    }
    if (state?.error && !state.fieldErrors) {
        toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  },[state, toast, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{parentId ? 'Create New Sub-chapter' : 'Create New Chapter'}</span>
            {bookName && <Badge variant="outline">{bookName}</Badge>}
          </DialogTitle>
          <DialogDescription>Add a new chapter section to this book.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="bookId" value={bookId} />
          {parentId && <input type="hidden" name="parentId" value={String(parentId)} />}
          <div>
            <Label htmlFor="chapter-name">Chapter Name</Label>
            <Input id="chapter-name" name="name" />
            {state?.fieldErrors?.name && <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
          </div>
          <div>
            <Label htmlFor="topic">Topic / Theme (Optional)</Label>
            <Input id="topic" name="topic" placeholder="e.g., The Nature of Dharma" />
            {state?.fieldErrors?.topic && <p className="text-sm text-destructive mt-1">{state.fieldErrors.topic[0]}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <SubmitButton>Create Chapter</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CommentaryDialog({
  trigger,
  initialData,
  onSave,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  trigger?: ReactNode;
  initialData?: CommentaryInfo;
  onSave: (data: CommentaryInfo) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const [type, setType] = useState(initialData?.type || 'bhashya');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [workName, setWorkName,
] = useState(initialData?.workName || '');
  const [shortName, setShortName] = useState(initialData?.shortName || '');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type && author && workName && shortName) {
      onSave({ type, author, workName, shortName });
      setOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out all commentary fields.',
        });
    }
  };

  useEffect(() => {
    if (open) {
        setType(initialData?.type || 'bhashya');
        setAuthor(initialData?.author || '');
        setWorkName(initialData?.workName || '');
        setShortName(initialData?.shortName || '');
    }
  }, [open, initialData]);

  const commentaryTypes = Object.values(COMMENTARY_TYPE_GROUPS).flat();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Commentary Tag</DialogTitle>
          <DialogDescription>
            Tag this content block with detailed commentary information.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="commentary-type">Type of Commentary</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="commentary-type">
                <SelectValue placeholder="Select a commentary type" />
              </SelectTrigger>
              <SelectContent>
                {commentaryTypes.map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="author-name">Author Name</Label>
            <Input id="author-name" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g., Śaṅkarācārya" />
          </div>
          <div>
            <Label htmlFor="work-name">Commentary Work Name</Label>
            <Input id="work-name" value={workName} onChange={e => setWorkName(e.target.value)} placeholder="e.g., Gītā Bhāṣya" />
          </div>
          <div>
            <Label htmlFor="short-name">Short Name / Abbreviation</Label>
            <Input id="short-name" value={shortName} onChange={e => setShortName(e.target.value)} placeholder="e.g., Śāṅkara Bhāṣya" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
            <Button type="submit">Save Commentary</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SourceInfoDialog({
  open,
  onOpenChange,
  blockType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockType: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Source Information</DialogTitle>
          <DialogDescription>
            This block is tagged as a primary source text.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h3 className="font-semibold text-lg">{getIastLabelById(blockType)} ({getSanskritLabelById(blockType)})</h3>
            <p className="text-muted-foreground mt-2">To change this type, please use the block context menu in the editor.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export const getCategoryForType = (type: string | undefined): 'source' | 'commentary' => {
    if (!type) return 'source';
    return ALL_COMMENTARY_TYPES.includes(type) ? 'commentary' : 'source';
}

export function AddBlockDialog({
  children,
  onAddBlock,
  structure,
}: {
  children: ReactNode;
  onAddBlock: (type: string) => void;
  structure?: BookStructure;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: string) => {
    onAddBlock(type);
    setOpen(false);
  };

  const sourceTypes = structure?.sourceTypes.map(id => ({ id, label: getTypeLabelById(id) })) || [];
  const commentaryTypes = structure?.commentaryTypes.map(id => ({ id, label: getTypeLabelById(id) })) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Content Block</DialogTitle>
          <DialogDescription>
            Select the type of content block to add based on your book's structure.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
                <h4 className="font-semibold text-center mb-2">Source Types</h4>
                <div className="flex flex-col gap-2">
                    {sourceTypes.map(type => (
                        <Button key={type.id} variant="outline" onClick={() => handleSelect(type.id)}>
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                 <h4 className="font-semibold text-center mb-2">Commentary Types</h4>
                <div className="flex flex-col gap-2">
                     {commentaryTypes.map(type => (
                        <Button key={type.id} variant="outline" onClick={() => handleSelect(type.id)}>
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GroupAsSeriesDialog({ children, selectedBookIds, onComplete }: { children: React.ReactNode, selectedBookIds: string[], onComplete: () => void }) {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(groupBooksIntoSeries, null);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [seriesName, setSeriesName] = useState('');
    const [allSeriesNames, setAllSeriesNames] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            getSeriesNames().then(setAllSeriesNames);
        }
    }, [open]);

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Success!', description: state.message });
            setOpen(false);
            formRef.current?.reset();
            setSeriesName('');
            onComplete();
            router.refresh();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast, router, onComplete]);

    const handleDialogChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSeriesName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Group Books into a Series</DialogTitle>
                    <DialogDescription>
                        You have selected {selectedBookIds.length} books. Assign a series name to group them. Volume numbers will be assigned automatically based on the current order.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="space-y-4">
                    <input type="hidden" name="bookIds" value={JSON.stringify(selectedBookIds)} />
                    <input type="hidden" name="seriesName" value={seriesName} />
                    <div>
                        <Label htmlFor="seriesName">Series Name</Label>
                         <CreatableCombobox
                            options={allSeriesNames.map(name => ({ value: name, label: name }))}
                            value={seriesName}
                            onValueChange={setSeriesName}
                            placeholder="Select or create a series..."
                            searchPlaceholder="Search series..."
                            emptyPlaceholder="No series found."
                            createPlaceholder={(val) => `Create new series "${val}"`}
                        />
                        {state?.fieldErrors?.seriesName && <p className="text-sm text-destructive mt-1">{state.fieldErrors.seriesName[0]}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
                        <SubmitButton>Create Series</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function EditSeriesDescriptionDialog({
    open,
    onOpenChange,
    seriesName,
    initialDescription
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    seriesName: string;
    initialDescription: string;
}) {
    const [state, formAction] = useActionState(updateSeriesDescription, null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.message });
            onOpenChange(false);
            router.refresh();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: "Error", description: state.error });
        }
    }, [state, toast, onOpenChange, router]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Series Description</DialogTitle>
                    <DialogDescription>Update the description for the "{seriesName}" series.</DialogDescription>
                </DialogHeader>
                 <form action={formAction} className="space-y-4">
                    <input type="hidden" name="seriesName" value={seriesName} />
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={initialDescription} rows={5} required />
                        {state?.fieldErrors?.description && <p className="text-sm text-destructive mt-1">{state.fieldErrors.description[0]}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton>Save Description</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export function UpdateBookVisibilityDialog({ book, children, circles }: { book: Book; children: React.ReactNode, circles: Circle[] }) {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(updateBookVisibility, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.message });
            setOpen(false);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);

    const userAdminCircles = circles.filter(c => c.members && c.members.some(m => m.userId === book.ownerId && m.role === 'admin'));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Visibility for {book.name}</DialogTitle>
                    <DialogDescription>
                        Control who can view this book.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={book.id} />
                    <RadioGroup name="visibility" defaultValue={book.visibility}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="v-public" />
                            <Label htmlFor="v-public">Public - Anyone can view.</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="circle" id="v-circle" />
                             <Label htmlFor="v-circle">Circle - Only members of selected circles can view.</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="v-private" />
                             <Label htmlFor="v-private">Private - Only you can view.</Label>
                        </div>
                    </RadioGroup>
                    <div className="space-y-2">
                        <Label>Select Circles (if applicable)</Label>
                        <ScrollArea className="h-32 border rounded-md p-2">
                           <div className="space-y-2">
                                {userAdminCircles.map(circle => (
                                    <div key={circle.id} className="flex items-center space-x-2">
                                        <Checkbox id={`circle-${circle.id}`} name="circleIds" value={circle.id} defaultChecked={book.circleIds?.includes(circle.id)} />
                                        <Label htmlFor={`circle-${circle.id}`}>{circle.name}</Label>
                                    </div>
                                ))}
                           </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
                        <SubmitButton>Set Visibility</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ChangeBlockTypeDialog({
  open,
  onOpenChange,
  initialType,
  onUpdateType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: string;
  onUpdateType: (newType: string) => void;
}) {
  const [selectedType, setSelectedType] = useState(initialType);
  const { toast } = useToast();

  const handleUpdate = () => {
    onUpdateType(selectedType);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Block Type</DialogTitle>
          <DialogDescription>
            Select a new type for this content block.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Label>Block Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(SOURCE_TYPE_GROUPS).map(([groupName, groupItems]) => (
                        <SelectGroup key={groupName}>
                            <SelectLabel className="capitalize">{groupName}</SelectLabel>
                            {groupItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
          <Button onClick={handleUpdate}>Update Type</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
