
'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { type Comment } from '@/lib/data-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, User, MessageSquare, Loader2, Pencil, Trash2 } from 'lucide-react';
import { handleCommentFeedback, handleAddReply, handleDeleteComment, handleUpdateComment } from '@/app/articles/actions';
import { useToast } from '@/hooks/use-toast';
import { Transliterate } from './transliteration-provider';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

// --- Sub-components for CommentCard ---

function EditCommentDialog({ open, onOpenChange, comment, articleInfo }: { open: boolean, onOpenChange: (open: boolean) => void, comment: Comment, articleInfo: { bookId: string, chapterId: string, verse: string } }) {
    const [state, formAction] = useActionState(handleUpdateComment, null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast({ title: state.message || 'Comment updated!' });
            onOpenChange(false);
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Comment</DialogTitle>
                    <DialogDescription>
                        Modify your comment below.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="bookId" value={articleInfo.bookId} />
                    <input type="hidden" name="chapterId" value={articleInfo.chapterId} />
                    <input type="hidden" name="verse" value={articleInfo.verse} />
                    <input type="hidden" name="commentId" value={comment.id} />
                    
                    <div>
                        <Label htmlFor={`edit-title-${comment.id}`}>Title</Label>
                        <Input id={`edit-title-${comment.id}`} name="title" defaultValue={comment.title} required />
                         {state?.fieldErrors?.title && <p className="text-sm text-destructive mt-1">{state.fieldErrors.title[0]}</p>}
                    </div>

                     <div>
                        <Label htmlFor={`edit-body-${comment.id}`}>Comment</Label>
                        <Textarea id={`edit-body-${comment.id}`} name="body" defaultValue={comment.body} required rows={4} />
                         {state?.fieldErrors?.body && <p className="text-sm text-destructive mt-1">{state.fieldErrors.body[0]}</p>}
                    </div>
                     <div>
                        <Label htmlFor={`edit-tags-${comment.id}`}>Reason Tags (comma-separated)</Label>
                        <Input id={`edit-tags-${comment.id}`} name="reasonTags" defaultValue={comment.reasonTags?.join(', ')} />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteCommentButton({ comment, articleInfo }: { comment: Comment, articleInfo: { bookId: string, chapterId: string, verse: string } }) {
    const [state, formAction] = useActionState(handleDeleteComment, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: state.message || 'Comment deleted!' });
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);

    return (
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="bookId" value={articleInfo.bookId} />
                    <input type="hidden" name="chapterId" value={articleInfo.chapterId} />
                    <input type="hidden" name="verse" value={articleInfo.verse} />
                    <input type="hidden" name="commentId" value={comment.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this comment. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" variant="destructive">Delete</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}


function FeedbackButton({ action, count, formAction }: { action: 'like' | 'dislike', count: number, formAction: (payload: FormData) => void }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" name="action" value={action} variant="ghost" size="sm" disabled={pending}>
            {action === 'like' ? <ThumbsUp className="mr-2 h-4 w-4" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
            {count}
        </Button>
    )
}

function ReplySubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Reply
        </Button>
    );
}

function ReplyForm({
    articleId,
    bookId,
    chapterId,
    parentCommentId,
    onSubmitted
}: {
    articleId: string,
    bookId: string,
    chapterId: string,
    parentCommentId: string,
    onSubmitted: () => void
}) {
    const [state, formAction] = useActionState(handleAddReply, null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast({ title: state.message || 'Reply posted!' });
            formRef.current?.reset();
            onSubmitted();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error posting reply', description: state.error });
        }
    }, [state, toast, onSubmitted]);

    return (
        <form action={formAction} ref={formRef} className="mt-4 ml-8 space-y-2">
            <input type="hidden" name="bookId" value={bookId} />
            <input type="hidden" name="chapterId" value={chapterId} />
            <input type="hidden" name="verse" value={articleId} />
            <input type="hidden" name="parentCommentId" value={parentCommentId} />
            <Textarea
                name="body"
                placeholder="Write a reply..."
                rows={2}
                required
                className="text-sm"
            />
            {state?.fieldErrors?.body && <p className="text-sm text-destructive">{state.fieldErrors.body[0]}</p>}
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onSubmitted}>Cancel</Button>
                <ReplySubmitButton />
            </div>
        </form>
    );
}

// --- Main CommentCard Component ---

function CommentCard({ comment, articleId, bookId, chapterId, isReply = false }: { comment: Comment, articleId: string, bookId: string, chapterId: string, isReply?: boolean }) {
    const [feedbackState, feedbackFormAction] = useActionState(handleCommentFeedback, null);
    const { toast } = useToast();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if(feedbackState?.error) {
            toast({ variant: 'destructive', title: 'Error', description: feedbackState.error });
        }
    }, [feedbackState, toast]);

    const date = new Date(comment.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    return (
        <div>
            <EditCommentDialog open={isEditing} onOpenChange={setIsEditing} comment={comment} articleInfo={{bookId, chapterId, verse: articleId}} />
            <Card className={isReply ? 'bg-muted/50' : ''}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            {comment.title && <CardTitle className="font-devanagari"><Transliterate>{comment.title}</Transliterate></CardTitle>}
                            <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                <User className="h-3 w-3" /> Anonymous on {date}
                            </CardDescription>
                        </div>
                         <div className="flex flex-wrap gap-1">
                            {comment.reasonTags && comment.reasonTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {comment.targetText && (
                        <blockquote className="border-l-4 pl-4 italic text-muted-foreground my-2">
                            <Transliterate>{comment.targetText}</Transliterate>
                        </blockquote>
                    )}
                    <p className={cn("mt-4", !comment.targetText && "mt-0")}><Transliterate>{comment.body}</Transliterate></p>
                </CardContent>
                <CardFooter className="justify-between">
                     <form action={feedbackFormAction} className="flex items-center gap-2">
                        <input type="hidden" name="bookId" value={bookId} />
                        <input type="hidden" name="chapterId" value={chapterId} />
                        <input type="hidden" name="verse" value={articleId} />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <FeedbackButton action="like" count={comment.feedback.likes} formAction={feedbackFormAction} />
                        <FeedbackButton action="dislike" count={comment.feedback.dislikes} formAction={feedbackFormAction} />
                    </form>
                    <div className="flex items-center gap-1">
                        {!isReply && (
                            <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Reply
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteCommentButton comment={comment} articleInfo={{bookId, chapterId, verse: articleId}} />
                    </div>
                </CardFooter>
            </Card>

            {showReplyForm && (
                <ReplyForm
                    articleId={articleId}
                    bookId={bookId}
                    chapterId={chapterId}
                    parentCommentId={comment.id}
                    onSubmitted={() => setShowReplyForm(false)}
                />
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-6 md:pl-10 mt-4 space-y-4 border-l-2 ml-4">
                    {comment.replies.map(reply => (
                        <CommentCard
                            key={reply.id}
                            comment={reply}
                            articleId={articleId}
                            bookId={bookId}
                            chapterId={chapterId}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ArticleComments({ comments, articleId, bookId, chapterId }: { comments: Comment[], articleId: string, bookId: string, chapterId: string }) {
    if (!comments || comments.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 no-print">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-primary" />
                Community Comments ({comments.length})
            </h2>
            <div className="space-y-6">
                {comments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} articleId={articleId} bookId={bookId} chapterId={chapterId} isReply={false} />
                ))}
            </div>
        </div>
    );
}
