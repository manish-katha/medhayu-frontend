
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Book, BookCategory, Article ,BookContent, Chapter, LinkableArticle } from '@/types/book';
import { migrateArticle,findArticleRecursive } from './service-utils';


import path from 'path';

const booksFilePath = path.join(corpusPath, 'books.json');
const bookCategoriesFilePath = path.join(corpusPath, 'book-categories.json');

export async function getBooks(): Promise<Book[]> {
  const books = await readJsonFile<Book[]>(booksFilePath, []);
  return books.sort((a, b) => a.name.localeCompare(b.name));
}

export async function writeBooks(books: Book[]): Promise<void> {
    await writeJsonFile(booksFilePath, books);
}

export async function addBook(book: Book) {
    const books = await getBooks();
    if (books.find(b => b.id === book.id)) {
        throw new Error('A book with this ID already exists.');
    }
    books.push(book);
    await writeJsonFile(booksFilePath, books);
    
    // Create an empty content file for the new book
    const newBookContent: BookContent = {
        bookId: book.id,
        bookName: book.name,
        author: book.author || 'Unknown',
        description: book.description,
        chapters: [],
        ownerId: 'researcher@vakyaverse.com', // default owner
        visibility: 'private',
        isAnnounced: false,
    };
    const contentFilePath = path.join(corpusPath, `${book.id}.json`);
    await writeJsonFile(contentFilePath, newBookContent);
}

export async function updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    const books = await getBooks();
    const bookIndex = books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
        throw new Error('Book not found.');
    }
    
    const { volumeSeriesName, volumeNumber, ...restOfBookData } = bookData as any;
    const existingBook = books[bookIndex];

    const updatedBook = { ...existingBook, ...restOfBookData };

    if (volumeSeriesName && volumeNumber) {
        updatedBook.volumeInfo = {
            seriesName: volumeSeriesName,
            volumeNumber: Number(volumeNumber),
        };
    } else if (volumeSeriesName === '' && 'volumeInfo' in updatedBook) {
        delete updatedBook.volumeInfo;
    }


    books[bookIndex] = updatedBook;
    await writeJsonFile(booksFilePath, books);
    
    // Also update the book's content file
    try {
        const content = await getBookContent(id);
        if (content) {
            content.bookName = updatedBook.name;
            content.author = updatedBook.author || 'Unknown';
            content.description = updatedBook.description;
            content.subtitle = updatedBook.subtitle;
            content.publisher = updatedBook.publisher;
            content.isbn = updatedBook.isbn;
            content.designer = updatedBook.designer;
            content.subject = updatedBook.subject;
            
            await writeBookContent(id, content);
        }
    } catch (e) {
        // It's okay if content file doesn't exist yet
    }

    return updatedBook;
}

export async function getBookCategories(): Promise<BookCategory[]> {
    const categories = await readJsonFile<BookCategory[]>(bookCategoriesFilePath, []);
    return categories.sort((a,b) => a.name.localeCompare(b.name));
}

export async function addBookCategory(name: string): Promise<BookCategory> {
    const categories = await getBookCategories();
    const newCategory: BookCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
    };
    if (categories.find(c => c.id === newCategory.id)) {
        throw new Error("Category with this ID already exists.");
    }
    categories.push(newCategory);
    await writeJsonFile(bookCategoriesFilePath, categories);
    return newCategory;
}

export async function getBooksWithStats(): Promise<Book[]> {
    const books = await getBooks();
    // In a real app, you'd fetch stats like chapter/article count
    return books;
}

export async function getBooksGroupedByCategory(): Promise<Record<string, Book[]>> {
    const books = await getBooks();
    const categories = await getBookCategories();
    const grouped: Record<string, Book[]> = {};

    categories.forEach(cat => {
        grouped[cat.name] = [];
    });
    if (!grouped['Uncategorized']) {
        grouped['Uncategorized'] = [];
    }

    books.forEach(book => {
        const category = categories.find(c => c.id === book.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(book);
    });

    return grouped;
}


export async function getBookContent(bookId: string): Promise<BookContent | null> {
    const books = await readJsonFile<Book[]>(booksFilePath, []);
    const bookData = books.find(b => b.id === bookId);
    
    if (!bookData) {
        return null;
    }
    
    try {
        const contentFilePath = path.join(corpusPath, `${bookId}.json`);
        const contentData = await readJsonFile<any>(contentFilePath, {});
        
        // Combine the metadata from books.json with the content from the specific file.
        const fullBookData = { 
            ...bookData,
            ...contentData,
            description: bookData.description || contentData.description,
        };

        if (fullBookData.chapters) {
            fullBookData.chapters.forEach((chapter: Chapter) => {
                if (chapter.articles) {
                    chapter.articles = chapter.articles.map(migrateArticle);
                } else {
                    chapter.articles = [];
                }
                 if (chapter.children) {
                     chapter.children.forEach(child => {
                        if(child.articles) {
                           child.articles = child.articles.map(migrateArticle);
                        } else {
                           child.articles = [];
                        }
                     })
                }
            });
        }


        return fullBookData as BookContent;
    } catch (error) {
        console.error(`Error reading book content for ${bookId}:`, error);
        return null;
    }
}

export async function writeBookContent(bookId: string, content: BookContent): Promise<void> {
    const filePath = path.join(corpusPath, `${bookId}.json`);
    await writeJsonFile(filePath, content);
}

export async function addChapter(bookId: string, chapterData: Omit<Chapter, 'id' | 'articles' | 'children'>, parentId?: string | number) {
    const bookContent = await getBookContent(bookId);
    if (!bookContent) throw new Error('Book not found');

    const newChapter: Chapter = {
        ...chapterData,
        id: `${(chapterData.name || 'chapter').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        articles: [],
        children: [],
    };
    
    if (parentId) {
        const parent = findChapter(bookContent.chapters, String(parentId));
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push(newChapter);
        }
    } else {
        bookContent.chapters.push(newChapter);
    }

    await writeBookContent(bookId, bookContent);
    return newChapter;
}

function findChapter(chapters: Chapter[], chapterId: string): Chapter | null {
  for (const chapter of chapters) {
    if (String(chapter.id) === chapterId) return chapter;
    if (chapter.children) {
      const found = findChapter(chapter.children, chapterId);
      if (found) return found;
    }
  }
  return null;
}


export async function getBookData(bookId: string): Promise<BookContent> {
    const book = (await readJsonFile<Book[]>(booksFilePath, [])).find(b => b.id === bookId);
    if (!book) throw new Error(`Book with id ${bookId} not found in books.json`);
    
    const bookContentPath = path.join(corpusPath, `${bookId}.json`);
    const data = await readJsonFile<any>(bookContentPath, {});

    if (!data.chapters) {
        data.chapters = []; 
    }

    data.chapters.forEach((chapter: Chapter) => {
        if (chapter.articles) {
            chapter.articles = chapter.articles.map(migrateArticle);
        } else {
            chapter.articles = [];
        }
        if (chapter.children) {
             chapter.children.forEach(child => {
                if(child.articles) {
                   child.articles = child.articles.map(migrateArticle);
                } else {
                   child.articles = [];
                }
             })
        }
    });
    
    if (!data.structure) {
        data.structure = {
            sourceTypes: ['shloka', 'sutra', 'gadya', 'padya'],
            commentaryTypes: ['bhashya', 'tika', 'vyakhya']
        }
    }
    
    return {
      ...data,
      ...book,
      bookId: book.id,
      bookName: book.name,
    };
}
export async function getArticle(bookId: string, chapterId: string, verse: string): Promise<{ book: BookContent, chapter: Chapter, article: Article } | null> {
    const content = await getBookData(bookId);
    if (!content) return null;
    
    const findResult = await findArticleRecursive(content.chapters, chapterId, verse);
    if (!findResult) return null;
    
    return { book: content, ...findResult };
}

export async function getSeriesNames(): Promise<string[]> {
    const books = await getBooks();
    const seriesNames = new Set<string>();

    for (const book of books) {
        if (book.volumeInfo?.seriesName) {
            seriesNames.add(book.volumeInfo.seriesName);
        }
    }

    return Array.from(seriesNames);
}

export async function groupBooksIntoSeries(seriesName: string, bookIds: string[]) {
    let allBooks = await getBooks();

    for (let i = 0; i < bookIds.length; i++) {
        const bookId = bookIds[i];
        const bookIndex = allBooks.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            allBooks[bookIndex].volumeInfo = {
                seriesName: seriesName,
                volumeNumber: i + 1,
            };
        }
    }
    await writeJsonFile(booksFilePath, allBooks);
}

export async function updateSeriesDescription(seriesName: string, description: string): Promise<void> {
    let allBooks = await getBooks();
    
    allBooks.forEach(book => {
        if (book.volumeInfo?.seriesName === seriesName) {
            book.shortDescription = description;
        }
    });

    await writeJsonFile(booksFilePath, allBooks);
}

export async function searchLinkableArticles(query: string): Promise<LinkableArticle[]> {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    
    const allBooks = await getBooks();
    const results: LinkableArticle[] = [];

    for (const book of allBooks) {
        if(book.name.toLowerCase().includes(lowerCaseQuery)) {
            results.push({
                id: book.id,
                label: `${book.name} (Book)`,
                url: `/medhayu/books/${book.id}`
            });
        }

        const content = await getBookContent(book.id);
        if (content) {
            const chapterQueue: Chapter[] = [...content.chapters];
            while(chapterQueue.length > 0) {
                const chapter = chapterQueue.shift();
                if(!chapter) continue;
                
                if (chapter.name.toLowerCase().includes(lowerCaseQuery)) {
                     results.push({
                        id: `${book.id}-${chapter.id}`,
                        label: `${chapter.name} in ${book.name}`,
                        url: `/medhayu/books/${book.id}?chapter=${chapter.id}`
                    });
                }
                
                if (chapter.articles) {
                    for (const article of chapter.articles) {
                        if (article.title.toLowerCase().includes(lowerCaseQuery) || String(article.verse).includes(lowerCaseQuery)) {
                             results.push({
                                id: `${book.id}-${chapter.id}-${article.verse}`,
                                label: `${article.title} (Verse ${article.verse}) in ${chapter.name}`,
                                url: `/medhayu/books/${book.id}/edit/${chapter.id}/${article.verse}`
                            });
                        }
                    }
                }

                if (chapter.children) {
                    chapterQueue.push(...chapter.children);
                }
            }
        }
    }
    return results.slice(0, 15);
}


