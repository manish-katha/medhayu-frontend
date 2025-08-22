

'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Palette } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteBook } from '@/actions/book.actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Book } from '@/types';

export function BookActions({ book }: { book: Book }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(deleteBook, null);
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Success', description: state.message || 'Book deleted successfully.' });
            setOpen(false);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setConfirmText('');
        }
        setOpen(isOpen);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More actions for {book.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/medhayu/books/${book.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Manage Content</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/medhayu/books/${book.id}/theme`}>
                            <Palette className="mr-2 h-4 w-4" />
                            <span>Edit Theme</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="bookId" value={book.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the book "{book.name}" and all of its content. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor={`delete-book-${book.id}`}>
                            To confirm, type "<strong className="text-destructive">DELETE</strong>" below.
                        </Label>
                        <Input
                            id={`delete-book-${book.id}`}
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            type="submit"
                            disabled={confirmText !== 'DELETE'}
                            className={cn(buttonVariants({ variant: "destructive" }))}
                        >
                            Delete Book
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
