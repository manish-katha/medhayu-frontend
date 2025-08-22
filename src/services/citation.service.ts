
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';
import type { CitationCategory, Citation } from '@/types/citation';

const citationsFilePath = path.join(corpusPath, 'citations.json');


export async function getCitationData(): Promise<CitationCategory[]> {
  return await readJsonFile<CitationCategory[]>(citationsFilePath, []);
}

export async function addCitationCategory(name: string): Promise<CitationCategory> {
  const categories = await getCitationData();
  const newCategory: CitationCategory = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    citations: [],
  };
  if (categories.find(c => c.id === newCategory.id)) {
    throw new Error('Category with this name already exists.');
  }
  categories.push(newCategory);
  await writeJsonFile(citationsFilePath, categories);
  return newCategory;
}

export async function deleteCitationCategory(id: string): Promise<void> {
    const categories = await getCitationData();
    const updatedCategories = categories.filter(c => c.id !== id);
    if (categories.length === updatedCategories.length) {
        throw new Error('Category not found.');
    }
    await writeJsonFile(citationsFilePath, updatedCategories);
}


export async function searchCitations(query: string): Promise<Citation[]> {
  const categories = await getCitationData();
  if (!query) return [];

  const lowerCaseQuery = query.toLowerCase();
  const allCitations = categories.flatMap(cat => cat.citations);
  
  return allCitations.filter(citation => 
    (citation.keywords || []).some(kw => kw.toLowerCase().includes(lowerCaseQuery)) ||
    (citation.sanskrit || '').toLowerCase().includes(lowerCaseQuery) ||
    (citation.english || '').toLowerCase().includes(lowerCaseQuery)
  );
}

export async function getCitationDetails(refId: string): Promise<Citation | null> {
    const categories = await getCitationData();
    const allCitations = categories.flatMap(cat => cat.citations);
    const citation = allCitations.find(c => c.refId === refId);
    return citation || null;
}

export async function addCitationToCategory(categoryId: string, citation: Citation) {
    const categories = await getCitationData();
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    category.citations.unshift(citation);
    await writeJsonFile(citationsFilePath, categories);
    return citation;
}
