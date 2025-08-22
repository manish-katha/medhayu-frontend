
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { runParser } from '@/services/glossary-parser.service';
import type { GlossaryTerm } from '@/types';
import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';

const glossaryFilePath = path.join(corpusPath, 'glossary.json');

// Schemas for form validation
const glossaryParserSchema = z.object({
  sourceType: z.enum(['paste', 'ai', 'upload']),
  paste_data: z.string().optional(),
  ai_data: z.string().optional(),
  file: z.instanceof(File).optional(),
}).refine(data => data.paste_data || data.ai_data || data.file, {
  message: 'Please provide data either by pasting, using AI parser, or uploading a file.',
});

const importGlossarySchema = z.object({
  terms: z.preprocess((val) => JSON.parse(val as string), z.array(z.any())),
  categoryId: z.string().min(1, "Category is required."),
});

// Server Action to run the parser
export async function runGlossaryParser(prevState: any, formData: FormData) {
  const file = formData.get('file') as File;
  const validatedFields = glossaryParserSchema.safeParse({
    sourceType: formData.get('sourceType'),
    paste_data: formData.get('paste_data'),
    ai_data: formData.get('ai_data'),
    file: file && file.size > 0 ? file : undefined,
  });
  
  if (!validatedFields.success) {
    return { error: 'Validation failed', fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  const { sourceType, paste_data, ai_data } = validatedFields.data;
  let rawContent: string = '';

  try {
    if (sourceType === 'paste' && paste_data) {
        rawContent = paste_data;
    } else if (sourceType === 'ai' && ai_data) {
        rawContent = ai_data;
    } else if (sourceType === 'upload' && file) {
        rawContent = await file.text();
    } else {
        return { error: 'No data provided for parsing.' };
    }
    
    const parsedData = await runParser(rawContent, sourceType);

    return { success: true, data: parsedData };
  } catch (error: any) {
    return { error: `Parsing failed: ${error.message}` };
  }
}

import path from 'path';

// Server Action to import the final data
export async function importGlossaryData(prevState: any, formData: FormData) {
    const validatedFields = importGlossarySchema.safeParse({
        terms: formData.get('terms'),
        categoryId: formData.get('categoryId'),
    });
    
    if (!validatedFields.success) {
        return { error: "Validation failed.", fieldErrors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { terms: newTerms, categoryId } = validatedFields.data;
    
    try {
        const allCategories = await readJsonFile(path.join(corpusPath, 'glossary-categories.json'), []);
        
        const categoryIndex = allCategories.findIndex((c: any) => c.id === categoryId);

        if (categoryIndex === -1) {
            return { error: "Category not found." };
        }
        
        const existingTerms = allCategories[categoryIndex].terms || [];
        const uniqueNewTerms = newTerms.filter((newTerm: GlossaryTerm) => 
            !existingTerms.some((existing: GlossaryTerm) => existing.term === newTerm.term)
        );

        allCategories[categoryIndex].terms = [...existingTerms, ...uniqueNewTerms];

        await writeJsonFile(path.join(corpusPath, 'glossary-categories.json'), allCategories);

        revalidatePath('/medhayu/glossary');
        return { success: true, message: `${uniqueNewTerms.length} new terms imported successfully into "${allCategories[categoryIndex].name}".` };

    } catch (error: any) {
        return { error: `Import failed: ${error.message}` };
    }
}
