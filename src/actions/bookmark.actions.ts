
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import { revalidatePath } from 'next/cache';
import type { Bookmark } from '@/types/book';
import path from 'path';

const bookmarksFilePath = path.join(corpusPath, 'bookmarks.json');

export async function addBookmark(formData: FormData) {
    const rawFormData = {
        userId: formData.get('userId') as string,
        type: formData.get('type') as 'article' | 'block',
        bookId: formData.get('bookId') as string,
        chapterId: formData.get('chapterId') as string,
        verse: formData.get('verse') as string,
        bookName: formData.get('bookName') as string,
        articleTitle: formData.get('articleTitle') as string,
    };

    if (!rawFormData.bookId || !rawFormData.chapterId || !rawFormData.verse) {
        return { error: "Missing required bookmark information." };
    }

    try {
        const bookmarks = await readJsonFile<Bookmark[]>(bookmarksFilePath, []);
        
        const newBookmark: Bookmark = {
            id: `bookmark-${Date.now()}`,
            createdAt: new Date().toISOString(),
            blockId: '', // blockId is not handled in this form
            blockTextPreview: '',
            note: '',
            ...rawFormData,
        };

        bookmarks.unshift(newBookmark);
        await writeJsonFile(bookmarksFilePath, bookmarks);
        
        // Revalidate the path where bookmarks are shown.
        // Assuming a profile page might show them.
        revalidatePath('/medhayu/profile');
        revalidatePath('/medhayu/living-document');

        return { success: true, message: 'Bookmark added!' };
    } catch (error) {
        console.error("Failed to add bookmark:", error);
        return { error: 'Could not save the bookmark.' };
    }
}
