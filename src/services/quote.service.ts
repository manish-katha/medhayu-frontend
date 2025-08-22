
'use server';

import { z } from 'zod';
import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Quote, QuoteCategory } from '@/types/quote';
import path from 'path';

const quoteCategoriesFilePath = path.join(corpusPath, 'quote-categories.json');

export async function getQuotes(): Promise<Quote[]> {
    const categories = await getQuoteData();
    return categories.flatMap(cat => cat.quotes || []);
}

export async function getQuoteCategories(): Promise<QuoteCategory[]> {
    return readJsonFile<QuoteCategory[]>(quoteCategoriesFilePath, []);
}

export async function getQuoteData(): Promise<QuoteCategory[]> {
    const categories = await readJsonFile<QuoteCategory[]>(quoteCategoriesFilePath, []);
    return categories.map(category => ({
        ...category,
        quotes: category.quotes || [],
    }));
}

export async function addQuote(quoteData: Omit<Quote, 'id'>): Promise<Quote> {
    const categories = await getQuoteData();
    const category = categories.find(c => c.id === quoteData.categoryId);

    if (!category) {
        throw new Error("Category not found");
    }

    const newQuote: Quote = {
        id: `quote-${Date.now()}`,
        ...quoteData,
    };
    
    if (!category.quotes) {
        category.quotes = [];
    }
    
    category.quotes.unshift(newQuote);
    await writeJsonFile(quoteCategoriesFilePath, categories);
    return newQuote;
}


const suggestQuotesForArticleSchema = z.string();

export async function suggestQuotesForArticle(articleText: string): Promise<any[]> {
    // In a real scenario, this would use an AI model to suggest quotes.
    // For now, we'll return a few from the existing quote list.
    const allQuotes = await getQuotes();
    return allQuotes.slice(0, 3);
}

const createQuoteSchema = z.object({
  quote: z.string().min(1, 'Quote text is required.'),
  author: z.string().min(1, 'Author is required.'),
  categoryId: z.string().min(1, 'Category is required.'),
  source: z.string().optional(),
});


export async function createQuote(prevState: any, formData: FormData) {
    const validatedFields = createQuoteSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const newQuote = await addQuote(validatedFields.data);
        revalidatePath('/admin/quotes'); // Or wherever quotes are managed
        return { success: true, message: 'Quote created!', data: newQuote };
    } catch (error: any) {
        return { success: false, message: `Failed to create quote: ${error.message}` };
    }
}
