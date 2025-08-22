
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useBookTheme } from './BookThemeContext';
import { BookThemeControls } from './BookThemeControls';
import { BookThemeLivePreview } from './BookThemeLivePreview';
import type { BookTheme, BookContent } from '@/types';
import { Button } from '../ui/button';
import { ArrowLeft, Save, Undo, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { handleSaveBookTheme } from '@/actions/book.actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface BookThemeEditorProps {
  initialTheme: BookTheme;
  defaultTheme: BookTheme;
  bookContent: BookContent;
}

function SaveButton() {
    const { pending } = useFormStatus();
    return (
        <Button size="sm" type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Theme
        </Button>
    )
}

export function BookThemeEditor({ initialTheme, defaultTheme, bookContent }: BookThemeEditorProps) {
  const { theme, setTheme } = useBookTheme();
  const [state, formAction] = useActionState(handleSaveBookTheme, null);
  const { toast } = useToast();
  
  const handleStyleChange = (element: keyof BookTheme['styles'], property: string, value: string) => {
    if (!theme) return;
    const newTheme = JSON.parse(JSON.stringify(theme)); // Deep copy
    if (!newTheme.styles[element]) {
        newTheme.styles[element] = {};
    }
    (newTheme.styles[element] as any)[property] = value;
    setTheme(newTheme);
  };
  
  const resetToDefault = () => {
    setTheme({ ...defaultTheme, bookId: theme?.bookId || 'unknown' });
  };
  
  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
    }
    if (state?.error) {
      toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  }, [state, toast]);
  
  if (!theme) return null;

  return (
    <div className="h-screen flex flex-col bg-muted/40">
       <form action={formAction}>
           <input type="hidden" name="bookId" value={theme.bookId} />
           <input type="hidden" name="themeData" value={JSON.stringify(theme)} />

           <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-20">
             <div className="flex items-center gap-2">
               <Button variant="link" className="p-0 h-auto text-muted-foreground" asChild>
                 <Link href={`/medhayu/books/${bookContent.bookId}`}>
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back to Book
                 </Link>
               </Button>
             </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={resetToDefault}>
                    <Undo className="mr-2 h-4 w-4" /> Reset to Default
                </Button>
                <SaveButton />
             </div>
           </header>
       </form>

       <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        <ScrollArea className="h-full">
            <BookThemeControls
                styles={theme.styles}
                defaultStyles={defaultTheme.styles}
                onStyleChange={handleStyleChange}
            />
        </ScrollArea>
        <BookThemeLivePreview bookContent={bookContent} />
       </div>
    </div>
  );
}
