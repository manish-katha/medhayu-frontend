
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { StandaloneArticle, StandaloneArticleCategory } from '@/types/article';
import path from 'path';

const articlesFilePath = path.join(corpusPath, 'standalone-articles.json');
const categoriesFilePath = path.join(corpusPath, 'standalone-article-categories.json');

// ====== Category Functions ======

export async function getStandaloneArticleCategories(): Promise<StandaloneArticleCategory[]> {
    return readJsonFile<StandaloneArticleCategory[]>(categoriesFilePath, []);
}

export async function addStandaloneArticleCategory(name: string): Promise<StandaloneArticleCategory> {
    const categories = await getStandaloneArticleCategories();
    const newCategory: StandaloneArticleCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
    };
    if (categories.some(c => c.id === newCategory.id)) {
        throw new Error("Category with this ID already exists.");
    }
    categories.push(newCategory);
    await writeJsonFile(categoriesFilePath, categories);
    return newCategory;
}

// ====== Article Functions ======

export async function getStandaloneArticles(): Promise<StandaloneArticle[]> {
    return readJsonFile<StandaloneArticle[]>(articlesFilePath, []);
}

export async function getStandaloneArticle(id: string): Promise<StandaloneArticle | null> {
    const articles = await getStandaloneArticles();
    return articles.find(article => article.id === id) || null;
}

export async function getStandaloneArticlesGroupedByCategory(): Promise<Record<string, StandaloneArticle[]>> {
    const articles = await getStandaloneArticles();
    const categories = await getStandaloneArticleCategories();
    
    const grouped: Record<string, StandaloneArticle[]> = {};

    categories.forEach(cat => {
        grouped[cat.name] = [];
    });
    
    articles.forEach(article => {
        const category = categories.find(c => c.id === article.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        if (!grouped[categoryName]) {
            grouped[categoryName] = [];
        }
        grouped[categoryName].push(article);
    });

    return grouped;
}

export async function addStandaloneArticle(articleData: Omit<StandaloneArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandaloneArticle> {
    const articles = await getStandaloneArticles();
    const now = new Date().toISOString();
    const newArticle: StandaloneArticle = {
        id: `article-${Date.now()}`,
        ...articleData,
        createdAt: now,
        updatedAt: now,
    };
    articles.unshift(newArticle);
    await writeJsonFile(articlesFilePath, articles);
    return newArticle;
}

export async function updateStandaloneArticle(id: string, updates: Partial<Omit<StandaloneArticle, 'id' | 'createdAt'>>): Promise<StandaloneArticle> {
    const articles = await getStandaloneArticles();
    const articleIndex = articles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
        throw new Error("Article not found.");
    }

    const updatedArticle = {
        ...articles[articleIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    articles[articleIndex] = updatedArticle;
    await writeJsonFile(articlesFilePath, articles);
    return updatedArticle;
}

export async function deleteStandaloneArticle(id: string): Promise<void> {
    let articles = await getStandaloneArticles();
    articles = articles.filter(article => article.id !== id);
    await writeJsonFile(articlesFilePath, articles);
}
