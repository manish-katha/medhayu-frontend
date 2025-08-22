

'use server';

import { revalidatePath } from 'next/cache';
import { addCommentToArticle, updateCommentInArticle, deleteCommentFromArticle, addCitationToCategory } from '@/services/comment.service';
import { z } from 'zod';

export async function handleArticleFeedback(prevState: any, formData: FormData) {
    const action = formData.get('action');
    const score = formData.get('score');
    const articleId = formData.get('articleId');
    // In a real app, you would save this feedback to a database.
    console.log({ articleId, action, score });
    return { success: true };
}

export async function handleAddComment(prevState: any, formData: FormData) {
  const data = {
    bookId: formData.get('bookId') as string,
    chapterId: formData.get('chapterId') as string,
    verse: formData.get('verse') as string,
    comment: {
      id: `comment-${Date.now()}`,
      authorId: 'anonymous',
      timestamp: new Date().toISOString(),
      body: formData.get('body') as string,
      targetText: formData.get('targetText') as string,
      replies: []
    }
  };

  try {
    await addCommentToArticle(data.bookId, data.chapterId, data.verse, data.comment, null);
    revalidatePath(`/living-document`);
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function handleAddReply(prevState: any, formData: FormData) {
   const data = {
    bookId: formData.get('bookId') as string,
    chapterId: formData.get('chapterId') as string,
    verse: formData.get('verse') as string,
    parentCommentId: formData.get('parentCommentId') as string,
    reply: {
      id: `comment-${Date.now()}`,
      authorId: 'anonymous',
      timestamp: new Date().toISOString(),
      body: formData.get('body') as string,
      targetText: null,
      replies: []
    }
  };
  
   try {
    await addCommentToArticle(data.bookId, data.chapterId, data.verse, data.reply, data.parentCommentId);
    revalidatePath(`/living-document`);
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}


export async function handleDeleteComment(prevState: any, formData: FormData) {
  try {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;
    const verse = formData.get('verse') as string;
    const commentId = formData.get('commentId') as string;
    await deleteCommentFromArticle(bookId, chapterId, verse, commentId);
    revalidatePath('/living-document');
    return { success: true, message: 'Comment deleted.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function handleUpdateComment(prevState: any, formData: FormData) {
    const bookId = formData.get('bookId') as string;
    const chapterId = formData.get('chapterId') as string;
    const verse = formData.get('verse') as string;
    const commentId = formData.get('commentId') as string;
    const body = formData.get('body') as string;
    
   try {
    await updateCommentInArticle(bookId, chapterId, verse, commentId, body);
    revalidatePath('/living-document');
    return { success: true, message: 'Comment updated.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

const userCitationSchema = z.object({
  sanskrit: z.string().min(1, 'Sanskrit text is required.'),
  source: z.string().min(1, 'Source is required.'),
  location: z.string().min(1, 'Location is required.'),
  translation: z.string().optional(),
  keywords: z.string().optional(),
});

export async function handleSaveUserCitation(prevState: any, formData: FormData) {
    const validatedFields = userCitationSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: "Validation failed",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const { keywords, ...rest } = validatedFields.data;
        const newCitation = {
            ...rest,
            refId: `user-${Date.now()}`,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            english: validatedFields.data.translation || '',
        };
        await addCitationToCategory('user-saved-notes', newCitation);
        revalidatePath('/medhayu/citations');
        return { success: true, message: 'Citation saved to your notes!' };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function handleAddLayer(prevState: any, formData: FormData) {
  console.log("handleAddLayer called");
  return { success: true, message: "Layer added (placeholder)." };
}

export async function handleLeaveSpark(prevState: any, formData: FormData) {
  console.log("handleLeaveSpark called");
  return { success: true, message: "Spark left (placeholder)." };
}

export async function handleStartDrift(prevState: any, formData: FormData) {
  console.log("handleStartDrift called");
  return { success: true, message: "Drift started (placeholder)." };
}

export async function handleConnectPoint(prevState: any, formData: FormData) {
  console.log("handleConnectPoint called");
  return { success: true, message: "Point connected (placeholder)." };
}

export async function saveBlockNote(prevState: any, formData: FormData) {
  console.log("saveBlockNote called");
  return { success: true, message: "Note saved (placeholder)." };
}
