
'use client';

import React, { useState, useActionState, useEffect, useRef, useCallback } from 'react';
import type { Editor, Range } from '@tiptap/react';
import { Discussion, Answer, UserProfile, Quote, QuoteCategory } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Separator } from '../ui/separator';
import AnswerCard from './AnswerCard';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { answerFormSchema, type AnswerFormValues } from '@/types/discussion';
import { addAnswer } from '@/actions/discussion.actions';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '../admin/editor/toolbar';
import { ThumbsUp, ThumbsDown, Bookmark, MessageSquare, Loader2, Send, Swords } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import ManthanaViewer from './ManthanaViewer';
import RequestManthanaDialog from './RequestManthanaDialog';
import { TextSelectionMenu } from '../medhayu/Article renderer/text-selection-menu';
import { UserCitationDialog } from '../medhayu/Article renderer/user-citation-dialog';
import { CreateQuoteDialog } from '../admin/quote-forms';
import { CommentFormDialog } from '../medhayu/Article renderer/comment-form-dialog';
import { getQuoteData } from '@/services/quote.service';


interface QuestionDetailProps {
  initialDiscussion: Discussion;
  currentUser: UserProfile;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Your Answer
        </Button>
    )
}

export default function QuestionDetail({ initialDiscussion, currentUser }: QuestionDetailProps) {
  const [discussion, setDiscussion] = useState(initialDiscussion);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [content, setContent] = useState('');
  const [isManthanaDialogOpen, setIsManthanaDialogOpen] = useState(false);
  const [state, formAction] = useActionState(addAnswer, null);
  const manthanaSectionRef = useRef<HTMLDivElement>(null);

  // State for scholarly tools
  const [selectedText, setSelectedText] = useState('');
  const [isCitationDialogOpen, setIsCitationDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [quoteCategories, setQuoteCategories] = useState<QuoteCategory[]>([]);
  const [quoteDialogState, setQuoteDialogState] = React.useState<{ open: boolean; text: string; range: Range | null }>({ open: false, text: '', range: null });

   useEffect(() => {
    getQuoteData().then(setQuoteCategories);
  }, []);

  useEffect(() => {
    if (state?.success && state.newAnswer) {
      setDiscussion(prev => ({
        ...prev,
        answers: [...prev.answers, state.newAnswer!],
      }));
      setContent('');
      editor?.commands.clearContent();
      toast({ title: "Answer Posted", description: "Your answer has been added to the discussion." });
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" });
    }
  }, [state, editor]);

  const hasManthana = discussion.manthana && discussion.manthana.length > 0;

  const handleManthanaClick = () => {
    if (hasManthana) {
      manthanaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsManthanaDialogOpen(true);
    }
  };

  const handleTextSelection = useCallback((text: string) => {
    if (text) setSelectedText(text);
  }, []);

  const handleSaveCitation = () => setIsCitationDialogOpen(true);
  const handleCreateQuote = () => setQuoteDialogState({ open: true, text: selectedText, range: null });
  const handleAddComment = () => setIsCommentDialogOpen(true);
  
  const handleRequestManthana = useCallback(() => {
      setIsManthanaDialogOpen(true);
  }, []);

  const handleQuoteCreated = (newQuote?: Quote) => {
    toast({ title: 'Quote Created!', description: 'Your new quote has been saved to the library.' });
  }

  const articleInfoForDialogs = {
      bookId: 'discussion',
      chapterId: discussion.category,
      verse: discussion.id,
  };


  return (
    <>
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{discussion.category}</Badge>
            {discussion.type === 'debate' && <Badge variant="secondary">Scholarly Debate</Badge>}
          </div>
          <h1 className="text-3xl font-bold font-headline">{discussion.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.name} />
                <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{discussion.author.name}</span>
            </div>
            <span>Asked {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
          </div>
           <TextSelectionMenu
              onSelectText={handleTextSelection}
              onSaveCitation={handleSaveCitation}
              onAddComment={handleAddComment}
              onCreateQuote={handleCreateQuote}
              onRequestManthana={handleRequestManthana}
            >
              <div
                className="prose prose-base dark:prose-invert max-w-none mt-6"
                dangerouslySetInnerHTML={{ __html: discussion.content }}
              />
            </TextSelectionMenu>
          <div className="flex flex-wrap gap-2 mt-4">
            {discussion.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-2">
             <div className="flex items-center gap-1 w-full">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-ayurveda-green">
                    <ThumbsUp size={14} /> Anukūla ({discussion.upvotes})
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-ayurveda-terracotta">
                    <ThumbsDown size={14} /> Pratikūla ({discussion.downvotes})
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground" onClick={handleManthanaClick}>
                    <Swords size={14} /> 
                    {hasManthana ? 'SAMVADA Started' : 'Request Manthana'}
                </Button>
                 <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                    <Bookmark size={14} /> Bookmark
                </Button>
            </div>
        </CardFooter>
      </Card>
      
       {hasManthana && (
         <div className="space-y-4" ref={manthanaSectionRef}>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Swords /> Manthana (Debate)
            </h2>
            <Separator />
            {discussion.manthana.map(thread => (
                <ManthanaViewer key={thread.id} thread={thread} discussionId={discussion.id} />
            ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          {discussion.answers.length} Answers
        </h2>
        <Separator />
        {discussion.answers.map(answer => (
          <AnswerCard 
            key={answer.id} 
            answer={answer} 
            currentUser={currentUser} 
            onSelectText={handleTextSelection}
            onSaveCitation={handleSaveCitation}
            onAddComment={handleAddComment}
            onCreateQuote={handleCreateQuote}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Your Answer</h3>
            <form action={formAction}>
                <input type="hidden" name="discussionId" value={discussion.id} />
                <input type="hidden" name="content" value={content} />
                <input type="hidden" name="references" value="[]" /> {/* Placeholder for now */}
                
                <div 
                    className="border rounded-md min-h-[150px] flex flex-col cursor-text mb-4"
                    onClick={() => editor?.commands.focus()}
                >
                    {editor && <EditorToolbar editor={editor} />}
                    <div className="p-2 flex-grow">
                        <RichTextEditor
                            id="answer-body"
                            content={content}
                            onChange={setContent}
                            setEditorInstance={(id, instance) => setEditor(instance)}
                            placeholder="Compose your answer with formatting and references..."
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
     <UserCitationDialog
        open={isCitationDialogOpen}
        onOpenChange={setIsCitationDialogOpen}
        sanskritText={selectedText}
        source={{ name: `Discussion: ${discussion.title}`, location: `Question`}}
    />
    <CreateQuoteDialog
        open={quoteDialogState.open}
        onOpenChange={(isOpen) => setQuoteDialogState(prev => ({ ...prev, open: isOpen }))}
        onQuoteCreated={handleQuoteCreated}
        initialQuote={quoteDialogState.text}
        categories={quoteCategories}
    />
     <CommentFormDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        targetText={selectedText}
        articleInfo={{ bookId: 'discussions', chapterId: discussion.id, verse: 'question' }}
    />
    <RequestManthanaDialog
        open={isManthanaDialogOpen}
        onOpenChange={setIsManthanaDialogOpen}
        discussionId={discussion.id}
        initialPurvapaksha={selectedText}
    />
    </>
  );
}
