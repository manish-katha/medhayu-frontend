
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StandaloneArticle } from '@/types/article';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

interface ArticlesTabProps {
  articles: StandaloneArticle[];
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({ articles }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Articles & Publications</CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length > 0 ? (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <Link href={`/articles/edit/${article.id}`} className="font-semibold hover:underline">{article.title}</Link>
                  <p className="text-sm text-muted-foreground">
                    Type: <span className="capitalize">{article.type}</span> • Published: {format(new Date(article.createdAt), 'PPP')}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/articles/edit/${article.id}`}>View / Edit</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No articles published yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticlesTab;
