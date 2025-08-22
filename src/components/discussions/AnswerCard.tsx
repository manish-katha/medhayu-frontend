
'use client';

import React from 'react';
import { Answer, UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Verified, BookOpen, MessageSquare, Bookmark } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { TextSelectionMenu } from '../medhayu/Article renderer/text-selection-menu';

interface AnswerCardProps {
  answer: Answer;
  currentUser: UserProfile;
  onSelectText: (text: string) => void;
  onSaveCitation: () => void;
  onAddComment: () => void;
  onCreateQuote: () => void;
}

export default function AnswerCard({ 
  answer, 
  currentUser,
  onSelectText,
  onSaveCitation,
  onAddComment,
  onCreateQuote
}: AnswerCardProps) {
  const isOwnAnswer = answer.author.id === currentUser.email;

  return (
    <div className="flex items-start gap-4 py-4">
      <Avatar>
        <AvatarImage src={answer.author.avatarUrl} alt={answer.author.name} />
        <AvatarFallback>{answer.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{answer.author.name}</p>
          {answer.author.role === 'Acharya' && (
            <Verified className="h-4 w-4 text-ayurveda-green" />
          )}
          <p className="text-xs text-muted-foreground">
            answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
          </p>
        </div>
        <TextSelectionMenu
            onSelectText={onSelectText}
            onSaveCitation={onSaveCitation}
            onAddComment={onAddComment}
            onCreateQuote={onCreateQuote}
        >
            <div
            className="prose prose-sm dark:prose-invert max-w-none mt-2"
            dangerouslySetInnerHTML={{ __html: answer.content }}
            />
        </TextSelectionMenu>
        
        {answer.references && answer.references.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen size={16} /> References
            </h4>
            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
              {answer.references.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-1 mt-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-ayurveda-green">
            <ThumbsUp size={14} /> Anukūla ({answer.upvotes})
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-ayurveda-terracotta">
            <ThumbsDown size={14} /> Pratikūla ({answer.downvotes})
          </Button>
           <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare size={14} /> Add Tīkā
          </Button>
           <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <Bookmark size={14} /> Bookmark
          </Button>
        </div>
      </div>
    </div>
  );
}
