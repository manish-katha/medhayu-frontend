
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addCitationCategory, deleteCitationCategory as deleteCategoryFromService } from '@/services/citation.service';

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
});

export async function createCitationCategory(prevState: any, formData: FormData) {
  const validatedFields = categoryFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Validation failed.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const newCategory = await addCitationCategory(validatedFields.data.name);
    revalidatePath('/medhayu/citations');
    return { success: true, data: newCategory };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCitationCategory(id: string) {
    try {
        await deleteCategoryFromService(id);
        revalidatePath('/medhayu/citations');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Failed to delete collection.' };
    }
}
