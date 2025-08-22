
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Circle } from '@/types';
import path from 'path';

const circlesFilePath = path.join(corpusPath, 'circles.json');

const circleFormSchema = z.object({
  name: z.string().min(3, "Circle name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  rules: z.string().optional(),
  category: z.enum(['clinical', 'shastra', 'institutional']),
  type: z.enum(['personal', 'organization']),
  privacy: z.enum(['public', 'private', 'invite-only']),
  avatarUrl: z.string().url().optional(),
  // In a real app, the owner would be derived from the session
  ownerId: z.string().default('researcher@vakyaverse.com'),
  ownerName: z.string().default('Admin User'),
  ownerAvatar: z.string().default('/media/_cce41b04-07a0-4c49-bd66-7d2b4a59f1a7.jpg'),
});

export async function createCircle(prevState: any, formData: FormData) {
  const validatedFields = circleFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const circles = await readJsonFile<Circle[]>(circlesFilePath, []);
    const { ownerId, ownerName, ownerAvatar, ...rest } = validatedFields.data;
    
    const newCircle: Circle = {
      ...rest,
      id: `circle-${Date.now()}`,
      ownerId: ownerId,
      members: [{ userId: ownerId, name: ownerName, avatarUrl: ownerAvatar, role: 'admin' }],
      requests: [],
      createdAt: Date.now(),
      avatarUrl: rest.avatarUrl || '/media/default-circle-avatar.png'
    };

    circles.unshift(newCircle);
    await writeJsonFile(circlesFilePath, circles);

    revalidatePath('/medhayu/circles');
    return { success: true, message: 'Circle created successfully!' };
  } catch (error: any) {
    return { success: false, error: `Failed to create circle: ${error.message}` };
  }
}

export async function deleteCircle(circleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        let circles = await readJsonFile<Circle[]>(circlesFilePath, []);
        const initialLength = circles.length;
        circles = circles.filter(c => c.id !== circleId);
        
        if (circles.length === initialLength) {
            throw new Error("Circle not found.");
        }
        
        await writeJsonFile(circlesFilePath, circles);
        revalidatePath('/medhayu/circles');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Failed to delete circle.' };
    }
}
