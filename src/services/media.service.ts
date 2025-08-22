
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const mediaDir = path.join(process.cwd(), 'public', 'uploads', 'media');

async function ensureMediaDirExists() {
    try {
        await fs.access(mediaDir);
    } catch {
        await fs.mkdir(mediaDir, { recursive: true });
    }
}

export async function getMediaFiles(): Promise<string[]> {
    await ensureMediaDirExists();
    try {
        const files = await fs.readdir(mediaDir);
        // Return the public URLs, sorted with newest first
        return files
            .sort((a, b) => b.localeCompare(a))
            .map(file => `/uploads/media/${file}`);
    } catch (error) {
        console.error("Error reading media directory:", error);
        return [];
    }
}

export async function saveMediaFile(file: File): Promise<{ success: boolean; error?: string; filePath?: string }> {
    await ensureMediaDirExists();
    
    if (!file || file.size === 0) {
        return { success: false, error: 'No file provided or file is empty.' };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Sanitize filename to prevent directory traversal issues
        const filename = path.basename(file.name).replace(/\\/g, '/').replace(/\//g, '');
        const filePath = path.join(mediaDir, filename);
        
        await fs.writeFile(filePath, buffer);

        // Revalidate the path to the media page so the new image appears
        revalidatePath('/media');
        
        return { success: true, filePath: `/uploads/media/${filename}` };
    } catch (error: any) {
        console.error("Error saving file:", error);
        return { success: false, error: 'Failed to save file on the server.' };
    }
}
