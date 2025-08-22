
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Book } from '@/types/book';
import Link from 'next/link';
import Image from 'next/image';

interface BooksTabProps {
  books: Book[];
}

const BooksTab: React.FC<BooksTabProps> = ({ books }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authored & Collected Works</CardTitle>
      </CardHeader>
      <CardContent>
        {books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {books.map((book) => (
              <Link href={`/medhayu/books/${book.id}`} key={book.id}>
                <div className="group space-y-2 cursor-pointer">
                  <div className="aspect-[4/6] relative bg-muted rounded-md overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                    <Image
                      src={book.profileUrl || 'https://placehold.co/400x600.png'}
                      alt={book.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="book cover"
                    />
                  </div>
                  <p className="font-semibold text-sm truncate">{book.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No books have been added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BooksTab;
