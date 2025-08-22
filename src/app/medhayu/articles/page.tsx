

import { getStandaloneArticles, getStandaloneArticleCategories } from "@/services/standalone-article.service";
import { StandaloneArticleBrowser } from "@/components/admin/standalone-article-browser";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from 'next/link';

export default async function StandaloneArticlesPage() {
    const allArticles = await getStandaloneArticles();
    const categories = await getStandaloneArticleCategories();

    return (
        <div className="medhayu-module-container space-y-8 min-h-[calc(100vh-10rem)]">
            <h1 className="text-3xl font-bold">Manage Standalone Articles</h1>
            <StandaloneArticleBrowser 
                groupedArticles={allArticles.reduce((acc, article) => {
                    const categoryName = categories.find(c => c.id === article.categoryId)?.name || 'Uncategorized';
                    if (!acc[categoryName]) {
                        acc[categoryName] = [];
                    }
                    acc[categoryName].push(article);
                    return acc;
                }, {} as Record<string, StandaloneArticle[]>)}
                categories={categories}
            />
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button
                            size="icon"
                            className="h-16 w-16 rounded-full shadow-lg"
                            aria-label="Create new content"
                        >
                            <Plus className="h-8 w-8" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="mb-2">
                        <DropdownMenuItem asChild>
                            <Link href="/medhayu/articles/new/article">New Article</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Link href="/medhayu/articles/new/whitepaper">New White Paper</Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                             <Link href="/medhayu/articles/new/abstract">New Abstract</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
