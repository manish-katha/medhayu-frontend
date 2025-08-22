
'use client';

import React from 'react';
import type { StandaloneArticle, StandaloneArticleCategory } from '@/types/article';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, CirclePlus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreateBookCategoryDialog } from './book-forms';


interface StandaloneArticleBrowserProps {
    groupedArticles: Record<string, StandaloneArticle[]>;
    categories: StandaloneArticleCategory[];
}

const ArticleTable = ({ articles }: { articles: StandaloneArticle[] }) => {
    if (!articles || articles.length === 0) {
        return <p className="text-center text-muted-foreground p-4">No items in this category yet.</p>
    }
    return (
        <div className="relative w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {articles.map(article => (
                        <TableRow key={article.id}>
                            <TableCell className="font-medium">
                                <Link href={`/medhayu/articles/edit/${article.id}`} className="hover:underline">
                                    {article.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{article.categoryId}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/articles/edit/${article.id}`}>Edit</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Publish</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export function StandaloneArticleBrowser({ groupedArticles, categories }: StandaloneArticleBrowserProps) {
    const allArticles = Object.values(groupedArticles).flat();
    const articles = allArticles.filter(a => a.type === 'article');
    const whitepapers = allArticles.filter(a => a.type === 'whitepaper');
    const abstracts = allArticles.filter(a => a.type === 'abstract');

  return (
    <Card>
        <CardHeader>
             <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <CardTitle>Standalone Articles</CardTitle>
                    <CardDescription>Manage your individual articles, white papers, and abstracts.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <CreateBookCategoryDialog>
                         <Button variant="outline">
                            <CirclePlus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </CreateBookCategoryDialog>
                </div>
            </div>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="article">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="article">Article ({articles.length})</TabsTrigger>
                    <TabsTrigger value="whitepaper">White Paper ({whitepapers.length})</TabsTrigger>
                    <TabsTrigger value="abstract">Abstract ({abstracts.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="article">
                   <ArticleTable articles={articles} />
                </TabsContent>
                <TabsContent value="whitepaper">
                   <ArticleTable articles={whitepapers} />
                </TabsContent>
                <TabsContent value="abstract">
                   <ArticleTable articles={abstracts} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
