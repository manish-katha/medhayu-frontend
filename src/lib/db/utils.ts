import { promises as fs } from 'fs';
import path from 'path';

export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        await fs.access(filePath);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        if (fileContent.trim() === '') {
            return defaultValue;
        }
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist or is invalid JSON, return default value.
        // The calling function can then decide to write the default value back.
        console.warn(`Could not read file ${filePath}. Returning default value.`, error);
        return defaultValue;
    }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
        const directory = path.dirname(filePath);
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        throw error;
    }
}
