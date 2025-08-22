'use client';

import React, { useState, useEffect, useActionState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { handleAddReply, handleDeleteComment, handleUpdateComment } from '@/app/articles/actions';
import { formatDistanceToNow } from 'date-fns';
import { useFormStatus } from 'react-dom';
import { Loader2, CornerDownRight, Pencil, Trash2, Users } from 'lucide-react';
import type { Comment } from '@/types/comment';
import { Transliterate } from '@/components/transliteration-provider';

function ReplySubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reply
        </Button>
    )
}

function CommentThread({ articleInfo, comment, level = 0 }: {
    articleInfo: { bookId: string; chapterId: string; verse: string },
    comment: Comment,
    level?: number,
}) {
    const { toast } = useToast();
    const [isReplying, setIsReplying] = useState(false);
    const [replyState, replyAction] = useActionState(handleAddReply, null);
    const replyFormRef = React.useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (replyState?.success) {
            toast({ title: 'Reply posted!' });
            replyFormRef.current?.reset();
            setIsReplying(false);
        }
        if (replyState?.error) {
            toast({ variant: 'destructive', title: 'Error', description: replyState.error });
        }
    }, [replyState, toast]);

    const isAuthor = comment.authorId === 'anonymous'; // This should be dynamic in a real app

    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{comment.authorId.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-sm">{comment.authorId}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</p>
                    </div>
                    {isAuthor && (
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                    )}
                </div>

                {comment.targetText && (
                    <blockquote className="border-l-2 pl-2 text-xs italic text-muted-foreground">
                        “{comment.targetText}”
                    </blockquote>
                )}
                 <p className="text-sm">{comment.title}</p>
                 <p className="text-sm text-muted-foreground">{comment.body}</p>

                {!isReplying && (
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => setIsReplying(true)}>
                        <CornerDownRight className="mr-1 h-3 w-3" /> Reply
                    </Button>
                )}

                {isReplying && (
                    <form ref={replyFormRef} action={replyAction} className="space-y-2 pt-2">
                        <input type="hidden" name="bookId" value={articleInfo.bookId} />
                        <input type="hidden" name="chapterId" value={articleInfo.chapterId} />
                        <input type="hidden" name="verse" value={articleInfo.verse} />
                        <input type="hidden" name="parentCommentId" value={comment.id} />
                        <Textarea name="body" placeholder="Write a reply..." rows={2} className="text-sm" />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>Cancel</Button>
                            <ReplySubmitButton />
                        </div>
                    </form>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                    <div className="pt-3 space-y-3">
                        {comment.replies.map(reply => (
                            <CommentThread key={reply.id} articleInfo={articleInfo} comment={reply} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface ArticleCommentsProps {
    articleId: string;
    bookId: string;
    chapterId: string;
    comments: Comment[];
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId, bookId, chapterId, comments }) => {
    return (
         <Card className="bg-muted/50 border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Sahakāra Chakra
                </CardTitle>
                <CardDescription>Discussion threads for this article.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pr-4">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <CommentThread 
                                key={comment.id}
                                comment={comment}
                                articleInfo={{ 
                                    bookId: bookId, 
                                    chapterId: chapterId, 
                                    verse: articleId
                                }}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-8">No discussions started yet. Select text in the editor to add a comment.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}