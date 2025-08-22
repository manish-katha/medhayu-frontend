

'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { BookContent, Article, Comment, Citation } from '@/types';
import path from 'path';

async function getBookContent(bookId: string): Promise<BookContent | null> {
    try {
        const filePath = path.join(corpusPath, 'books', `${bookId}.json`);
        return readJsonFile<BookContent | null>(filePath, null);
    } catch(error) {
        console.error(`Error reading book content for ${bookId}:`, error);
        return null;
    }
}

async function writeBookContent(bookId: string, content: BookContent): Promise<void> {
    const filePath = path.join(corpusPath, 'books', `${bookId}.json`);
    await writeJsonFile(filePath, content);
}

function findArticle(chapters: any[], chapterId: string, verse: string): Article | null {
    for (const chapter of chapters) {
        if (String(chapter.id) === chapterId) {
            const article = chapter.articles.find((a: Article) => a.verse === verse);
            if (article) return article;
        }
        if (chapter.children) {
            const found = findArticle(chapter.children, chapterId, verse);
            if (found) return found;
        }
    }
    return null;
}

function findComment(comments: Comment[], commentId: string): { parent: Comment[] | null, comment: Comment | null, index: number } {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            return { parent: comments, comment: comments[i], index: i };
        }
        if (comments[i].replies) {
            const found = findComment(comments[i].replies, commentId);
            if (found.comment) {
                return found;
            }
        }
    }
    return { parent: null, comment: null, index: -1 };
}

export async function addCommentToArticle(bookId: string, chapterId: string, verse: string, comment: Comment, parentCommentId: string | null) {
    const bookContent = await getBookContent(bookId);
    if (!bookContent) {
        throw new Error('Book not found');
    }
    
    const article = findArticle(bookContent.chapters, chapterId, verse);
    if (!article) {
        throw new Error('Article not found');
    }
    
    if (!article.comments) {
        article.comments = [];
    }

    if (parentCommentId) {
        const { comment: parentComment } = findComment(article.comments, parentCommentId);
        if (parentComment) {
            if (!parentComment.replies) {
                parentComment.replies = [];
            }
            parentComment.replies.push(comment);
        } else {
            throw new Error('Parent comment not found');
        }
    } else {
        article.comments.push(comment);
    }

    await writeBookContent(bookId, bookContent);
    return comment;
}


export async function updateCommentInArticle(bookId: string, chapterId: string, verse: string, commentId: string, newBody: string) {
    const bookContent = await getBookContent(bookId);
    if (!bookContent) throw new Error('Book not found');

    const article = findArticle(bookContent.chapters, chapterId, verse);
    if (!article || !article.comments) throw new Error('Article or comments not found');

    const { comment } = findComment(article.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.body = newBody;
    await writeBookContent(bookId, bookContent);
    return comment;
}

export async function deleteCommentFromArticle(bookId: string, chapterId: string, verse: string, commentId: string) {
    const bookContent = await getBookContent(bookId);
    if (!bookContent) throw new Error('Book not found');

    const article = findArticle(bookContent.chapters, chapterId, verse);
    if (!article || !article.comments) throw new Error('Article or comments not found');

    const { parent, index } = findComment(article.comments, commentId);
    if (parent && index > -1) {
        parent.splice(index, 1);
        await writeBookContent(bookId, bookContent);
    } else {
        throw new Error('Comment not found');
    }
}

// Citations - This might be better in its own file, but for now:
import { getCitationData } from './citation.service';

const citationsFilePath = path.join(corpusPath, 'citations.json');

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
