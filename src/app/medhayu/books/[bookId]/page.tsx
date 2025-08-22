

import React, { use } from 'react';
import { BookDetailClientPage } from './BookDetailClientPage';
import { notFound } from 'next/navigation';
import { getBookContent } from '@/services/book.service';
import { getCirclesForUser } from '@/services/user.service';
import { getBookCategories } from '@/services/book.service';

export default async function BookDetailPage({ params: paramsProp }: { params: { bookId: string } }) {
    const params = use(paramsProp);
    const bookId = params.bookId;
    if (!bookId) {
        notFound();
    }

    // Fetch all data in parallel
    const [bookContent, circles, bookCategories] = await Promise.all([
        getBookContent(bookId),
        getCirclesForUser('researcher@vakyaverse.com'), // Assuming a default user
        getBookCategories()
    ]);
    
    // The notFound() should be called here if bookContent is null
    if (!bookContent) {
        notFound();
    }

    return (
        <div className="medhayu-module-container">
            <BookDetailClientPage 
                initialBookContent={bookContent}
                initialCircles={circles || []}
                initialBookCategories={bookCategories || []}
            />
        </div>
    );
}
