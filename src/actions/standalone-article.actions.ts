

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { 
    addStandaloneArticle, 
    updateStandaloneArticle as updateArticleInService,
    addStandaloneArticleCategory,
} from '@/services/standalone-article.service';
import { updateCaseStudy } from '@/services/case-study.service';
import type { StandaloneArticleType, WhitepaperContent } from '@/types/article';
import { redirect } from 'next/navigation';

const baseArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Summary/Abstract is too short."),
  type: z.enum(['article', 'abstract', 'whitepaper', 'case-study']),
  categoryId: z.string().min(1, "Please select a category."),
});

const whitepaperFormSchema = baseArticleSchema.extend({
  subtitle: z.string().optional(),
  authors: z.preprocess((val) => val ? JSON.parse(val as string) : [], z.array(z.any()).optional()),
  introduction: z.string().optional(),
  problemStatement: z.string().optional(),
  proposedSolution: z.string().optional(),
  classicalFramework: z.string().optional(),
  modernContext: z.string().optional(),
  implementationStrategy: z.string().optional(),
  observations: z.string().optional(),
  discussion: z.string().optional(),
  challenges: z.string().optional(),
  conclusion: z.string().optional(),
  references: z.preprocess((val) => val ? JSON.parse(val as string) : [], z.array(z.string()).optional()),
  appendices: z.string().optional(),
});


export async function createStandaloneArticle(prevState: any, formData: FormData) {
  const type = formData.get('type') as StandaloneArticleType;
  let validatedFields;
  let articleData: any;

  if (type === 'whitepaper' || type === 'abstract') {
      const rawData = Object.fromEntries(formData.entries());
      validatedFields = whitepaperFormSchema.safeParse(rawData);
      
      if (!validatedFields.success) {
        return { success: false, message: "Validation failed.", fieldErrors: validatedFields.error.flatten().fieldErrors };
      }
      const { title, content, type, categoryId, ...rest } = validatedFields.data;
      
      // Structure the content for whitepapers/abstracts
      const whitepaperContent: WhitepaperContent = {
        executiveSummary: content,
        ...rest
      };

      articleData = {
          title,
          type,
          categoryId,
          content: whitepaperContent, // Store as structured object
          tags: [],
      };
  } else {
      validatedFields = baseArticleSchema.safeParse(Object.fromEntries(formData.entries()));
       if (!validatedFields.success) {
        return { success: false, message: "Validation failed.", fieldErrors: validatedFields.error.flatten().fieldErrors };
      }
      articleData = {
        ...validatedFields.data,
        tags: [],
      };
  }
  
  try {
    const newArticle = await addStandaloneArticle(articleData);
    const redirectPath = `/medhayu/articles/edit/${newArticle.id}`;
    revalidatePath('/medhayu/articles');
    revalidatePath('/case-studies'); // Also revalidate case studies page
    return { success: true, message: 'Article created successfully!', redirectPath };
  } catch (error: any) {
    return { success: false, error: `Failed to create article: ${error.message}` };
  }
}


const updateArticleFormSchema = baseArticleSchema.extend({
    id: z.string().min(1),
});

export async function updateStandaloneArticle(prevState: any, formData: FormData) {
    const validatedFields = updateArticleFormSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        categoryId: formData.get('categoryId'),
    });
    
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, type, ...dataToUpdate } = validatedFields.data;

    try {
      if (type === 'case-study') {
          await updateCaseStudy(id, {
              title: dataToUpdate.title,
              // For now, we assume the content is the summary. This can be enhanced.
              summary: dataToUpdate.content.replace(/<[^>]*>?/gm, ''), 
          });
      } else {
        await updateArticleInService(id, dataToUpdate);
      }
        
      revalidatePath(`/medhayu/articles/edit/${id}`);
      revalidatePath('/medhayu/articles');
      revalidatePath('/case-studies');
      return { success: true, message: 'Content updated successfully!' };
    } catch (error: any) {
        return { success: false, error: `Failed to update content: ${error.message}` };
    }
}

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
});

export async function createStandaloneArticleCategory(prevState: any, formData: FormData) {
    const validatedFields = categoryFormSchema.safeParse({
        name: formData.get('name'),
    });
    
    if (!validatedFields.success) {
        return {
            success: false,
            error: "Validation failed.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        await addStandaloneArticleCategory(validatedFields.data.name);
        revalidatePath('/medhayu/articles/new/article'); // Revalidate any page that lists categories
        return { success: true, message: 'Category created!' };
    } catch (error: any) {
        return { success: false, error: `Failed to create category: ${error.message}` };
    }
}
