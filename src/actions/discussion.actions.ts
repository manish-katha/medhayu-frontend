
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDiscussion, addAnswerToDiscussion, addManthanaThread, addUttaraPaksha as addUttaraPakshaToService } from '@/services/discussion.service';
import { questionFormSchema, answerFormSchema, manthanaRequestSchema, Answer, QuestionFormValues, AnswerFormValues, ManthanaRequestValues, uttaraPakshaSchema } from '@/types/discussion';
import { getUserProfile } from '@/services/user.service';

export async function askQuestion(prevState: any, formData: FormData) {
  const validatedFields = questionFormSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    // The tags are now a stringified JSON array, so we need to parse them.
    tags: JSON.parse(formData.get('tags') as string || '[]'),
    category: formData.get('category'),
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const author = await getUserProfile();
    if (!author) throw new Error('User not found');

    const newQuestion = await addDiscussion({
      ...validatedFields.data,
      author: {
        id: author.email,
        name: author.name,
        avatarUrl: author.avatarUrl,
        role: author.experience[0]?.title
      }
    });

    revalidatePath('/medhayu/wall');
    return { success: true, newQuestionId: newQuestion.id };
  } catch (error: any) {
    return { error: `Failed to ask question: ${error.message}` };
  }
}


export async function addAnswer(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; newAnswer?: Answer }> {
    const validatedFields = answerFormSchema.safeParse({
        discussionId: formData.get('discussionId'),
        content: formData.get('content'),
        references: JSON.parse(formData.get('references') as string || '[]'),
    });

    if(!validatedFields.success) {
        console.error("Validation failed", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: 'Validation failed.' };
    }
    
    try {
        const author = await getUserProfile();
        if(!author) throw new Error("User not found");
        
        const newAnswer = await addAnswerToDiscussion(validatedFields.data.discussionId, {
            content: validatedFields.data.content,
            references: validatedFields.data.references,
            author: {
                id: author.email,
                name: author.name,
                avatarUrl: author.avatarUrl,
                role: author.experience[0]?.title
            }
        });
        
        revalidatePath(`/medhayu/discussions/q/${validatedFields.data.discussionId}`);
        return { success: true, newAnswer };

    } catch(error: any) {
        console.error("Failed to add answer:", error);
        return { success: false, error: error.message };
    }
}

export async function requestManthana(prevState: any, formData: FormData) {
    const validatedFields = manthanaRequestSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: 'Validation failed.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const author = await getUserProfile();
        if (!author) throw new Error("User not found");

        const { discussionId, topic, purvapaksha } = validatedFields.data;

        const newThread = await addManthanaThread(discussionId, topic, {
            author: {
                id: author.email,
                name: author.name,
                avatarUrl: author.avatarUrl,
                role: author.experience[0]?.title
            },
            content: purvapaksha,
            createdAt: new Date().toISOString(),
            stance: 'purvapaksha' // The first post is always the thesis
        });

        revalidatePath(`/medhayu/discussions/q/${discussionId}`);
        return { success: true, newThread };
    } catch (error: any) {
        return { error: `Failed to start debate: ${error.message}` };
    }
}

export async function addUttaraPaksha(prevState: any, formData: FormData) {
    const validatedFields = uttaraPakshaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: 'Validation failed.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const author = await getUserProfile();
        if (!author) throw new Error("User not found");

        const { discussionId, threadId, content, stance } = validatedFields.data;

        const newEntry = await addUttaraPakshaToService(discussionId, threadId, {
            author: {
                id: author.email,
                name: author.name,
                avatarUrl: author.avatarUrl,
                role: author.experience[0]?.title
            },
            content,
            stance, // Pass the stance
            createdAt: new Date().toISOString(),
        });

        revalidatePath(`/medhayu/discussions/q/${discussionId}`);
        return { success: true, newEntry };
    } catch (error: any) {
        return { error: `Failed to add counter-argument: ${error.message}` };
    }
}
