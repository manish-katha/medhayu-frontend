
'use server';

import { readJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { GlossaryCategory, GlossaryTerm } from '@/types/glossary';
import path from 'path';

const glossaryCategoriesFilePath = path.join(corpusPath, 'glossary-categories.json');

export async function getGlossaryData(): Promise<GlossaryCategory[]> {
    return readJsonFile<GlossaryCategory[]>(glossaryCategoriesFilePath, []);
}


export async function getFullGlossary(): Promise<GlossaryTerm[]> {
    const categories = await getGlossaryData();
    // Flatten all terms from all categories into a single array
    return categories.flatMap(category => category.terms);
}
