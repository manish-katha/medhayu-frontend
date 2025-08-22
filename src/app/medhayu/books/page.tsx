

import { getBooksGroupedByCategory, getBookCategories } from '@/services/book.service';
import { BookFormDialog, CreateBookCategoryDialog } from "@/components/admin/book-forms";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus, Library, UploadCloud } from "lucide-react";
import { BookBrowser } from "@/components/admin/book-browser";
import Link from 'next/link';

export default async function BooksPage() {
    const groupedBooks = await getBooksGroupedByCategory();
    const categories = await getBookCategories();
    const hasContent = Object.values(groupedBooks).some(books => books.length > 0) || Object.keys(groupedBooks).some(category => groupedBooks[category].length > 0);

    return (
        <div className="medhayu-module-container space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Your Library</h1>
                    <p className="text-muted-foreground">Browse all your authored and collected works.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Bulk Import
                    </Button>
                    <CreateBookCategoryDialog>
                         <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </CreateBookCategoryDialog>
                </div>
            </div>
            
            {hasContent ? (
                <>
                    <BookBrowser groupedBooks={groupedBooks} />
                    <BookFormDialog
                        trigger={
                            <Button
                                size="icon"
                                className="fixed z-10 bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                aria-label="Create new book"
                            >
                                <Plus className="h-8 w-8" />
                            </Button>
                        }
                        categories={categories}
                    />
                </>
            ) : (
                <div className="flex items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <Library className="h-16 w-16 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold text-foreground">Your Library is Empty</h2>
                        <p className="max-w-xs">Create your first book to begin populating your corpus of sacred texts.</p>
                        <BookFormDialog 
                            trigger={
                                <Button size="lg" className="mt-4">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create First Book
                                </Button>
                            } 
                            categories={categories}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
