
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addBook, addBookCategory, getBookContent, writeBookContent, addChapter as addChapterToService, groupBooksIntoSeries as groupBooksIntoSeriesInService, getSeriesNames, getBooks, writeBooks, updateBook as updateBookInService, updateSeriesDescription as updateSeriesDescriptionInService } from '@/services/book.service';
import type { Book, Chapter, BookTheme } from '@/types';
import slugify from 'slugify';
import { arrayMove } from '@dnd-kit/sortable';
import path from 'path';
import { promises as fs } from 'fs';
import { corpusPath } from '@/lib/db/paths';


const bookFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Book name must be at least 3 characters'),
  subtitle: z.string().optional(),
  author: z.string().min(2, 'Author name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  subject: z.string().optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  designer: z.string().optional(),
  publishedAt: z.string().optional(),
  coverUrl: z.string().optional(),
  profileUrl: z.string().optional(),
  volumeSeriesName: z.string().optional(),
  volumeNumber: z.coerce.number().optional(),
});

export async function createBook(prevState: any, formData: FormData) {
  const validatedFields = bookFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const bookId = slugify(validatedFields.data.name, { lower: true, strict: true });
    const newBook: Book = {
      id: bookId,
      ...validatedFields.data,
      ownerId: 'researcher@vakyaverse.com', // default owner
      visibility: 'private',
      isAnnounced: false,
    };
    await addBook(newBook);
    revalidatePath('/medhayu/books');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateBook(prevState: any, formData: FormData) {
    const validatedFields = bookFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success || !validatedFields.data.id) {
        return {
            error: "Validation failed or ID missing",
            fieldErrors: validatedFields.error?.flatten().fieldErrors,
        };
    }
    
    try {
        await updateBookInService(validatedFields.data.id, validatedFields.data);
        revalidatePath(`/medhayu/books/${validatedFields.data.id}`);
        revalidatePath('/medhayu/books');
        return { success: true, message: 'Book updated successfully.' };
    } catch (e: any) {
        return { error: e.message };
    }
}


const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
});

export async function createBookCategory(prevState: any, formData: FormData) {
  const validatedFields = categoryFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Validation failed.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const newCategory = await addBookCategory(validatedFields.data.name);
    revalidatePath('/medhayu/books');
    return { success: true, data: newCategory };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBook(prevState: any, formData: FormData) {
    const bookId = formData.get('bookId') as string;
    if (!bookId) {
        return { error: "Book ID is missing." };
    }

    try {
        let allBooks = await getBooks();
        const initialLength = allBooks.length;
        allBooks = allBooks.filter(b => b.id !== bookId);

        if (allBooks.length === initialLength) {
            return { error: 'Book not found.' };
        }

        await writeBooks(allBooks);

        // Also delete the content file
        const contentFilePath = path.join(corpusPath, 'books', `${bookId}.json`);
        try {
            await fs.unlink(contentFilePath);
        } catch (fileError: any) {
            // Ignore if file doesn't exist, but log other errors
            if (fileError.code !== 'ENOENT') {
                console.error(`Could not delete content file for ${bookId}:`, fileError);
            }
        }
        
        revalidatePath('/medhayu/books');
        return { success: true, message: "Book deleted successfully." };
    } catch (e: any) {
        return { error: e.message };
    }
}


const chapterFormSchema = z.object({
  name: z.string().min(2, "Chapter name is required."),
  topic: z.string().optional(),
});

export async function createChapter(prevState: any, formData: FormData) {
  const bookId = formData.get('bookId') as string;
  const parentId = formData.get('parentId') as string | undefined;

  const validatedFields = chapterFormSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      error: "Validation failed.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addChapterToService(bookId, validatedFields.data, parentId);
    revalidatePath(`/medhayu/books/${bookId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}


const articleFormSchema = z.object({
  title: z.string().min(1),
  verse: z.string().min(1),
  content: z.string(), // JSON string
  tags: z.string(), // JSON string
});

export async function createArticle(prevState: any, formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;

    const validatedFields = articleFormSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: 'Validation failed', fieldErrors: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");

        const chapter = findChapter(bookContent.chapters, chapterId);
        if (!chapter) throw new Error("Chapter not found");
        
        const newArticle = {
            id: validatedFields.data.verse,
            ...validatedFields.data,
            content: JSON.parse(validatedFields.data.content),
            tags: JSON.parse(validatedFields.data.tags),
        };

        if (!chapter.articles) {
          chapter.articles = [];
        }
        chapter.articles.push(newArticle);

        await writeBookContent(bookId, bookContent);

        revalidatePath(`/medhayu/books/${bookId}`);
        return { success: true, redirectPath: `/medhayu/books/${bookId}/edit/${chapterId}/${newArticle.verse}` };

    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateArticle(prevState: any, formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;

    const validatedFields = articleFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Validation failed', fieldErrors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");
        
        const chapter = findChapter(bookContent.chapters, chapterId);
        if (!chapter) throw new Error("Chapter not found");
        
        const articleIndex = chapter.articles.findIndex(a => a.verse === validatedFields.data.verse);
        if (articleIndex === -1) throw new Error("Article not found");
        
        chapter.articles[articleIndex] = {
            ...chapter.articles[articleIndex],
            ...validatedFields.data,
            content: JSON.parse(validatedFields.data.content),
            tags: JSON.parse(validatedFields.data.tags),
        };
        
        await writeBookContent(bookId, bookContent);

        revalidatePath(`/medhayu/books/${bookId}`);
        revalidatePath(`/medhayu/books/${bookId}/edit/${chapterId}/${validatedFields.data.verse}`);
        return { success: true };

    } catch (e: any) {
        return { error: e.message };
    }
}

export async function reorderContent(formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapters = JSON.parse(formData.get('chapters') as string);
    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");
        
        bookContent.chapters = chapters;
        await writeBookContent(bookId, bookContent);
        revalidatePath(`/medhayu/books/${bookId}`);
        return { success: true };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function updateArticleStatus(formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;
    const verse = formData.get('verse') as string;
    const newStatus = formData.get('newStatus') as 'draft' | 'published';
    
    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");

        const chapter = findChapter(bookContent.chapters, chapterId);
        if (!chapter) throw new Error("Chapter not found");

        const article = chapter.articles.find(a => a.verse === verse);
        if (!article) throw new Error("Article not found");

        article.status = newStatus;

        await writeBookContent(bookId, bookContent);
        revalidatePath(`/medhayu/books/${bookId}`);
        return { success: true };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteArticle(formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;
    const verse = formData.get('verse') as string;
    
    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");

        const chapter = findChapter(bookContent.chapters, chapterId);
        if (!chapter) throw new Error("Chapter not found");

        chapter.articles = chapter.articles.filter(a => a.verse !== verse);
        
        await writeBookContent(bookId, bookContent);
        revalidatePath(`/medhayu/books/${bookId}`);
        return { success: true };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteChapter(formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;
    
    try {
        const bookContent = await getBookContent(bookId);
        if (!bookContent) throw new Error("Book not found");
        
        bookContent.chapters = removeChapter(bookContent.chapters, chapterId);

        await writeBookContent(bookId, bookContent);
        revalidatePath(`/medhayu/books/${bookId}`);
        return { success: true };
    } catch(e: any) {
        return { error: e.message };
    }
}


export async function updateBookVisibility(prevState: any, formData: FormData) {
    // This is a placeholder for a more complex action
    const bookId = formData.get('bookId') as string;
    const visibility = formData.get('visibility') as string;
    console.log(`Updating visibility for ${bookId} to ${visibility}`);
    revalidatePath(`/medhayu/books/${bookId}`);
    return { success: true, message: 'Visibility updated!' };
}

const groupBooksSchema = z.object({
  seriesName: z.string().min(1, 'Series name is required.'),
  bookIds: z.preprocess((val) => JSON.parse(val as string), z.array(z.string()).min(1)),
});

export async function groupBooksIntoSeries(prevState: any, formData: FormData) {
  const validatedFields = groupBooksSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
      return { error: "Validation failed.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await groupBooksIntoSeriesInService(validatedFields.data.seriesName, validatedFields.data.bookIds);
    revalidatePath('/medhayu/books');
    return { success: true, message: 'Books have been grouped into the series.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

const seriesDescriptionSchema = z.object({
    seriesName: z.string().min(1),
    description: z.string().min(1, 'Description cannot be empty.'),
});

export async function updateSeriesDescription(prevState: any, formData: FormData) {
    const validatedFields = seriesDescriptionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: "Validation failed.", fieldErrors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await updateSeriesDescriptionInService(validatedFields.data.seriesName, validatedFields.data.description);
        revalidatePath('/medhayu/books');
        return { success: true, message: 'Series description updated.' };
    } catch (e: any) {
        return { error: e.message };
    }
}

async function saveThemeForBook(bookId: string, themeData: BookTheme): Promise<void> {
  const themeFilePath = path.join(corpusPath, 'themes', `${bookId}.json`);
  await writeJsonFile(themeFilePath, themeData);
}


export async function handleSaveBookTheme(prevState: any, formData: FormData) {
  const bookId = formData.get('bookId') as string;
  const themeDataString = formData.get('themeData') as string;

  if (!bookId || !themeDataString) {
    return { error: 'Missing book ID or theme data.' };
  }

  try {
    const themeData = JSON.parse(themeDataString) as BookTheme;
    await saveThemeForBook(bookId, themeData);
    revalidatePath(`/medhayu/books/${bookId}/theme`);
    return { success: true, message: 'Theme saved successfully!' };
  } catch (error: any) {
    return { error: `Failed to save theme: ${error.message}` };
  }
}


// --- Helper functions ---

function findChapter(chapters: Chapter[], chapterId: string): Chapter | null {
  for (const chapter of chapters) {
    if (String(chapter.id) === chapterId) return chapter;
    if (chapter.children) {
      const found = findChapter(chapter.children, chapterId);
      if (found) return found;
    }
  }
  return null;
}

function removeChapter(chapters: Chapter[], chapterId: string): Chapter[] {
    return chapters.filter(c => String(c.id) !== chapterId).map(c => {
        if (c.children) {
            return { ...c, children: removeChapter(c.children, chapterId) };
        }
        return c;
    });
}
