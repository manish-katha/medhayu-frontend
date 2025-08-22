
'use client';

import React, { useState, useMemo } from 'react';
import { Discussion } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Plus, Search, Users, BarChart2, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuestionListItem from './QuestionListItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

const TrendingTagsWidget = () => {
    const tags = ["achara rasayana", "agni", "ashtanga hrudaya", "ayurvedic treatment", "bams", "basti", "charaka samhita", "kshara", "nasya", "shastra", "sushruta samhita", "tantra"];
    return (
        <Card>
            <CardHeader className="p-4">
                <h3 className="font-semibold flex items-center gap-2"><Tag size={18}/> Trending Tags</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Button key={tag} variant="outline" size="sm" className="h-auto py-1 px-2 text-xs">{tag}</Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

interface DiscussionListProps {
  initialDiscussions: Discussion[];
}

export function DiscussionList({ initialDiscussions }: DiscussionListProps) {
  const router = useRouter();
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [activeTab, setActiveTab] = useState('newest');

  const filteredAndSortedDiscussions = useMemo(() => {
    let filtered = [...discussions];

    if (activeTab === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'most-answered') {
      filtered.sort((a, b) => b.answers.length - a.answers.length);
    } else if (activeTab === 'most-visited') {
        filtered.sort((a,b) => (b.views || 0) - (a.views || 0));
    } else if (activeTab === 'most-voted') {
        filtered.sort((a,b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (activeTab === 'no-answers') {
        filtered = filtered.filter(d => d.answers.length === 0);
    }

    return filtered;
  }, [discussions, activeTab]);

  const tabs = [
    { value: "newest", label: "Recent Questions" },
    { value: "most-answered", label: "Most Answered" },
    { value: "most-visited", label: "Most Visited" },
    { value: "most-voted", label: "Most Voted" },
    { value: "no-answers", label: "No Answers" },
    { value: "trending-tags", label: "Trending Tags" },
  ];

  return (
    <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="trending-tags" className="mt-4">
                <TrendingTagsWidget />
            </TabsContent>
            {tabs.filter(t => t.value !== 'trending-tags').map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                     <section className="space-y-4">
                        {filteredAndSortedDiscussions.map(discussion => (
                        <QuestionListItem key={discussion.id} discussion={discussion} />
                        ))}
                    </section>
                </TabsContent>
            ))}
        </Tabs>
    </div>
  );
}
