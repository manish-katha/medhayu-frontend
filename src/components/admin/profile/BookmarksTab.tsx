
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bookmark as BookmarkType } from '@/types/book';
import { Bookmark, FileText } from 'lucide-react';
import Link from 'next/link';

interface BookmarksTabProps {
  bookmarks: BookmarkType[];
}

const BookmarksTab: React.FC<BookmarksTabProps> = ({ bookmarks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookmarks</CardTitle>
      </CardHeader>
      <CardContent>
        {bookmarks.length > 0 ? (
          <ul className="space-y-3">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{bookmark.articleTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      In: <span className="font-medium">{bookmark.bookName}</span>
                    </p>
                  </div>
                   <Link href={`/medhayu/living-document?bookId=${bookmark.bookId}&verse=${bookmark.verse}`}>
                      <FileText className="h-5 w-5 text-muted-foreground hover:text-primary" />
                   </Link>
                </div>
                {bookmark.note && (
                  <blockquote className="mt-2 pl-3 border-l-2 text-sm italic">
                    {bookmark.note}
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="mx-auto h-12 w-12" />
            <p className="mt-2">You haven't saved any bookmarks yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookmarksTab;
