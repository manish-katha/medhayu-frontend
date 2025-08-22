
'use client';

import React from 'react';
import { Discussion } from '@/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Eye, Tag, Folder, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface QuestionListItemProps {
  discussion: Discussion;
}

// Helper to strip HTML and truncate text
const createExcerpt = (html: string, length = 150) => {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

export default function QuestionListItem({ discussion }: QuestionListItemProps) {
  const totalAnukula = discussion.upvotes || 0;
  const excerpt = createExcerpt(discussion.content);

  return (
    <article className="bg-card border rounded-lg flex p-4 gap-4">
      <div className="flex flex-col items-center gap-1 text-center w-16 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-500">
            <ChevronUp />
        </Button>
        <span className="font-bold text-lg">{totalAnukula}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
            <ChevronDown />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-auto" />

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-6 w-6">
                <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.name} />
                <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                 <a href="#" className="font-semibold text-sm hover:underline">{discussion.author.name}</a>
                 {discussion.author.role && <Badge variant="secondary" className="ml-2">{discussion.author.role}</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">
                asked {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
            </span>
        </div>
        
        <h2 className="text-lg font-semibold mt-2">
          <Link href={`/medhayu/discussions/q/${discussion.id}`} className="hover:text-primary">
            {discussion.title}
          </Link>
        </h2>
        
        {excerpt && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {excerpt}
            </p>
        )}

        <Separator className="my-3" />

         <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Folder size={14}/> {discussion.category}</span>
                <span className="flex items-center gap-1">
                    <Tag size={14}/>
                    {discussion.tags.map((tag, index) => (
                      <React.Fragment key={tag}>
                        <a href="#" className="hover:underline">{tag}</a>
                        {index < discussion.tags.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><MessageSquare size={14}/> {discussion.answers.length} Answers</span>
                <span className="flex items-center gap-1"><Eye size={14}/> {discussion.views || 0} Views</span>
            </div>
         </div>
      </div>
    </article>
  );
}
