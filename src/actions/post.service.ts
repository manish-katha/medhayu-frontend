

'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Post } from '@/types/post';
import { UserProfile } from '@/types';
import path from 'path';
import { getUserProfile } from './user.service';
import { revalidatePath } from 'next/cache';


const postsFilePath = path.join(corpusPath, 'posts.json');

export async function getPosts(userId?: string): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const posts = await readJsonFile<Post[]>(postsFilePath, []);
  
  const sortedPosts = posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (userId) {
    return sortedPosts.filter(p => p.author.id === userId);
  }
  return sortedPosts;
}

export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'author'>): Promise<Post> {
    const posts = await getPosts();
    const author = await getUserProfile(); // Fetch the current user profile

    if(!author) {
        throw new Error("User not found, cannot create post.");
    }
    
    const newPost: Post = {
        id: `post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        author: {
            id: author.email,
            name: author.name,
            avatarUrl: author.avatarUrl,
            role: author.experience[0]?.title
        },
        ...postData,
    };
    posts.unshift(newPost);
    await writeJsonFile(postsFilePath, posts);
    return newPost;
}

export async function deletePost(postId: string): Promise<{ success: boolean, error?: string }> {
    try {
        let posts = await getPosts();
        posts = posts.filter(p => p.id !== postId);
        await writeJsonFile(postsFilePath, posts);
        revalidatePath('/medhayu/wall');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete post:", error);
        return { success: false, error: 'Could not delete the post.' };
    }
}
