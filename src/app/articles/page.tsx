import { getStandaloneArticlesGroupedByCategory, getStandaloneArticleCategories } from "@/services/standalone-article.service";
import { StandaloneArticleBrowser } from "@/components/admin/standalone-article-browser";

export default async function StandaloneArticlesPage() {
    const groupedArticles = await getStandaloneArticlesGroupedByCategory();
    const categories = await getStandaloneArticleCategories();

    return (
        <div className="space-y-8 min-h-[calc(100vh-10rem)]">
            <h1 className="text-3xl font-bold">Manage Standalone Articles</h1>
            <StandaloneArticleBrowser 
                groupedArticles={groupedArticles} 
                categories={categories} 
            />
        </div>
    )
}
