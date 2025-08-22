'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import type { Chapter } from '@/types';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';


interface ChapterSummary {
    id: string | number;
    name: string;
    topic?: string;
    articleCount: number;
    childrenCount: number;
    children: ChapterSummary[];
    articles: { verse: string | number; title: string }[];
}

interface ChapterBrowserProps {
    chapters: Chapter[];
    bookId: string;
}

function mapChaptersToSummary(chapters: Chapter[]): ChapterSummary[] {
    return chapters.map(chapter => ({
        id: chapter.id,
        name: chapter.name,
        topic: chapter.topic,
        articleCount: chapter.articles?.length || 0,
        childrenCount: chapter.children?.length || 0,
        articles: (chapter.articles || []).map(a => ({ verse: a.verse, title: a.title })),
        children: chapter.children ? mapChaptersToSummary(chapter.children) : [],
    }));
}


function ChapterCard({ chapter, bookId }: { chapter: ChapterSummary; bookId: string }) {
    const hasContent = chapter.articleCount > 0 || chapter.childrenCount > 0;
    
    return (
        <Card className="h-full hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col">
            <CardHeader>
                <Folder className="h-8 w-8 text-primary mb-4" />
                <CardTitle className="font-headline group-hover:underline">{chapter.name}</CardTitle>
                {chapter.topic && <CardDescription>{chapter.topic}</CardDescription>}
            </CardHeader>
            <CardContent className="mt-auto">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{chapter.articleCount} articles</Badge>
                    {chapter.childrenCount > 0 && <Badge variant="outline">{chapter.childrenCount} sub-chapters</Badge>}
                </div>
                 {hasContent && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-xs text-muted-foreground mb-2">Articles:</h4>
                        <div className="space-y-1">
                        {chapter.articles.slice(0, 3).map(article => (
                            <Link key={String(article.verse)} href={`/articles/${bookId}/${chapter.id}/${article.verse}`} className="text-sm block hover:underline truncate">{article.title}</Link>
                        ))}
                        {chapter.articles.length > 3 && <p className="text-xs text-muted-foreground">...and more</p>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ChapterListItem({ chapter, bookId, level = 0 }: { chapter: ChapterSummary; bookId: string; level?: number }) {
    const [isOpen, setIsOpen] = useState(level < 1);
    
    return (
        <div className={cn(level > 0 && "pl-4 ml-4 border-l")}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center w-full text-left p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                        {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                        <div className="flex-1">
                            <p className="font-semibold text-lg">{chapter.name}</p>
                             {chapter.topic && <p className="text-sm text-muted-foreground">{chapter.topic}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary">{chapter.articleCount} articles</Badge>
                           {chapter.childrenCount > 0 && <Badge variant="outline">{chapter.childrenCount} sub-chapters</Badge>}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="py-2 pl-6">
                        {chapter.articles.map(article => (
                             <Link key={String(article.verse)} href={`/articles/${bookId}/${chapter.id}/${article.verse}`} className="block p-2 rounded-md hover:bg-muted text-sm">
                                {article.title}
                            </Link>
                        ))}
                         {chapter.children.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {chapter.children.map(child => (
                                    <ChapterListItem key={String(child.id)} chapter={child} bookId={bookId} level={level + 1} />
                                ))}
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

function ChapterTree({ chapters, bookId, view }: { chapters: ChapterSummary[], bookId: string, view: 'list' | 'grid' }) {
    if (view === 'grid') {
        const allChapters: ChapterSummary[] = [];
        const flattenChapters = (chapList: ChapterSummary[]) => {
            for (const chap of chapList) {
                allChapters.push(chap);
                if (chap.children) {
                    flattenChapters(chap.children);
                }
            }
        }
        flattenChapters(chapters);

        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allChapters.map(chapter => (
                    <ChapterCard key={String(chapter.id)} chapter={chapter} bookId={bookId} />
                ))}
            </div>
        )
    }
    
    return (
        <div className="space-y-2">
             {chapters.map(chapter => (
                <ChapterListItem key={String(chapter.id)} chapter={chapter} bookId={bookId} />
            ))}
        </div>
    )
}


export function ChapterBrowser({ chapters, bookId }: ChapterBrowserProps) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const chapterSummaries = mapChaptersToSummary(chapters);

    return (
        <div className="space-y-6">
             <div className="flex justify-end">
                <ToggleGroup type="single" value={view} onValueChange={(value) => { if (value) setView(value as any) }}>
                    <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid /></ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view"><List /></ToggleGroupItem>
                </ToggleGroup>
            </div>
            <ChapterTree chapters={chapterSummaries} bookId={bookId} view={view} />
        </div>
    );
}
