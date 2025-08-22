
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Editor, Range } from '@tiptap/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post, addPost, getPosts, deletePost } from '@/services/post.service';
import type { UserProfile, Circle, Book, StandaloneArticle, Quote as QuoteType, QuoteCategory, Discussion, CaseStudy } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Repeat, BookOpen, Quote as QuoteIcon, ChevronDown, TrendingUp, Rss, Plus, Leaf, FileText, Microscope, Heart, Send, Save, Bookmark, HelpCircle, Check, Star, Users, Stethoscope, Building, Sparkles, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { getQuoteData } from '@/services/quote.service';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { ShareWorkDialog } from '@/components/medhayu/wall/ShareWorkDialog';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import AskQuestionForm from '@/components/discussions/AskQuestionForm';
import { getDiscussions, addDiscussion } from '@/services/discussion.service';
import { DravyagunaPostDialog } from '@/components/medhayu/wall/DravyagunaPostDialog';
import { DravyaPostCard } from '@/components/medhayu/wall/DravyaPostCard';
import NextImage from 'next/image';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getCaseStudies } from '@/services/case-study.service';
import { useRouter } from 'next/navigation';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { explainPost } from '@/ai/flows/explain-post';
import { useToast } from '@/hooks/use-toast';
import { TextSelectionMenu } from '@/components/medhayu/Article renderer/text-selection-menu';
import { UserCitationDialog } from '@/components/medhayu/Article renderer/user-citation-dialog';
import { CommentFormDialog } from '@/components/medhayu/Article renderer/comment-form-dialog';
import RequestManthanaDialog from '@/components/discussions/RequestManthanaDialog';
import { getUserProfile } from '@/services/user.service';
import { getCirclesForUser } from '@/services/profile.service';
import DeleteConfirmationDialog from '@/components/Patients/Profile/DeleteConfirmationDialog';
import { ScholarlyContentParser } from '@/components/medhayu/wall/ScholarlyContentParser';


interface WallPageClientProps {
  posts: Post[];
  userProfile: UserProfile;
  userCircles: Circle[];
  discussions: Discussion[];
}

const ReactionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm" onClick={onClick}>
        {icon}
        {label}
    </Button>
);

const reactionConfig = {
    appreciate: { icon: <Heart size={16} />, label: 'Appreciate' },
    discuss: { icon: <MessageSquare size={16} />, label: 'Discuss' },
    share: { icon: <Repeat size={16} />, label: 'Share Forward' },
    save: { icon: <Bookmark size={16} />, label: 'Save for Later' },
    inspire: { icon: <Star size={16} />, label: 'Inspire Me' },
    tried: { icon: <ThumbsUp size={16} />, label: 'Tried This' },
    add_to_notes: { icon: <BookOpen size={16} />, label: 'Add to Notes' },
    respect: { icon: <Leaf size={16} />, label: 'Respect Wisdom' },
    ask_question: { icon: <HelpCircle size={16} />, label: 'Ask a Question' },
    interested: { icon: <Check size={16} />, label: 'I’m Interested' },
    vote: { icon: <ThumbsUp size={16} />, label: 'Vote' },
};

const postTypeToReactionsMap: Record<Post['postType'], (keyof typeof reactionConfig)[]> = {
    thought: ['appreciate', 'discuss', 'share', 'save', 'inspire'],
    dravyaguna: ['appreciate', 'discuss', 'save', 'tried', 'add_to_notes'],
    shloka: ['respect', 'discuss', 'save', 'ask_question'],
    'case-study': ['appreciate', 'discuss', 'save', 'tried', 'ask_question'],
    dinacharya: ['appreciate', 'discuss', 'save', 'inspire'],
    tips: ['appreciate', 'save', 'inspire', 'share'],
    formulation: ['tried', 'add_to_notes', 'discuss', 'save'],
    event: ['appreciate', 'share', 'save', 'interested'],
    poll: ['vote', 'discuss', 'save'],
    question: ['discuss', 'save'], // Default for question type
    book: ['appreciate', 'discuss', 'share', 'save'],
    'book-article': ['appreciate', 'discuss', 'share', 'save'],
    article: ['appreciate', 'discuss', 'share', 'save'],
    whitepaper: ['appreciate', 'discuss', 'share', 'save'],
    abstract: ['appreciate', 'discuss', 'share', 'save'],
};


const AttachedWorkCard = ({ post }: { post: Post }) => {
    if (!post.attachedWork) return null;
    
    return (
        <Card className="mt-4 overflow-hidden">
            <div className="flex">
                {post.attachedWork.profileUrl && (
                    <div className="flex-shrink-0 w-24">
                        <NextImage src={post.attachedWork.profileUrl} alt={post.attachedWork.title} width={120} height={180} className="w-full h-full object-cover" />
                    </div>
                )}
                 <div className="flex-1 p-4">
                    <CardTitle className="text-base">{post.attachedWork.title}</CardTitle>
                    <CardDescription>{post.attachedWork.parentTitle}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2" dangerouslySetInnerHTML={{__html: post.attachedWork.description || ''}} />
                </div>
            </div>
        </Card>
    )
};


const PostCard = ({ 
  post, 
  userProfile,
  onPostUpdate,
  onSelectText,
  onSaveCitation,
  onAddComment,
  onCreateQuote,
  onRequestManthana,
  onPostToWall,
  onPostDeleted
}: { 
  post: Post, 
  userProfile: UserProfile,
  onPostUpdate: (updatedPost: Post) => void,
  onSelectText: (text: string) => void;
  onSaveCitation: () => void;
  onAddComment: () => void;
  onCreateQuote: () => void;
  onRequestManthana: (postId: string) => void;
  onPostToWall: (text: string) => void;
  onPostDeleted: () => void;
}) => {
    const router = useRouter();
    const { setAnalysis, openCopilotPanel } = useCopilot();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { toast } = useToast();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const isOwnPost = userProfile.email === post.author.id;

    const handleDeleteConfirm = async () => {
        const result = await deletePost(post.id);
        if (result.success) {
          toast({ title: 'Post Deleted', description: 'Your post has been removed from the wall.' });
          onPostDeleted();
        } else {
          toast({ title: 'Deletion Failed', description: result.error, variant: 'destructive' });
        }
        setIsDeleteConfirmOpen(false);
    };

    const handleDiscussionClick = async () => {
        if (post.status === 'thread-started') {
            router.push(`/medhayu/discussions/q/${post.id}`);
        } else {
            const newDiscussion = await addDiscussion({
                id: post.id,
                title: `Discussion for post: ${post.content.substring(0, 30)}...`,
                content: post.content,
                author: post.author,
                tags: [],
                category: 'General',
                type: 'general',
            });
            const updatedPost = { ...post, status: 'thread-started' as const };
            onPostUpdate(updatedPost);
            router.push(`/medhayu/discussions/q/${newDiscussion.id}`);
        }
    };
    
    const handleExplainClick = async () => {
        setIsAnalyzing(true);
        try {
            const result = await explainPost({ postContent: post.content });
            setAnalysis(
                 <div className="p-2 space-y-2">
                    <h3 className="font-semibold">AI Explanation</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
                </div>
            );
            openCopilotPanel();
        } catch (e) {
            console.error(e);
            toast({ title: 'Analysis Failed', description: 'Could not get an explanation from the AI.', variant: 'destructive' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (post.postType === 'dravyaguna') {
        return <DravyaPostCard post={post} />;
    }
    
    const reactions = postTypeToReactionsMap[post.postType] || postTypeToReactionsMap.thought;

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={post.author.avatarUrl} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{post.author.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExplainClick} disabled={isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </Button>
                        {isOwnPost && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical size={16}/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Post
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <TextSelectionMenu
                    onSelectText={onSelectText}
                    onSaveCitation={onSaveCitation}
                    onAddComment={onAddComment}
                    onCreateQuote={onCreateQuote}
                    onRequestManthana={() => onRequestManthana(post.id)}
                    onPostToWall={onPostToWall}
                 >
                    <ScholarlyContentParser content={post.content} />
                 </TextSelectionMenu>
                {post.attachedWork && <AttachedWorkCard post={post} />}
            </CardContent>
            <CardFooter className="border-t pt-2 flex justify-around">
                 {reactions.map(key => {
                    const reaction = reactionConfig[key];
                    if (key === 'discuss') {
                        const label = post.status === 'thread-started' ? 'Join Discussion' : 'Discuss';
                        return <ReactionButton key={key} icon={reaction.icon} label={label} onClick={handleDiscussionClick} />
                    }
                    return <ReactionButton key={key} icon={reaction.icon} label={reaction.label} />
                })}
            </CardFooter>
        </Card>

        <DeleteConfirmationDialog 
            isOpen={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirm={handleDeleteConfirm}
            resourceName="this post"
            resourceType="post"
        />
        </>
    )
};


const PostCreatorCard = ({ userProfile, onPostCreated, onDravyaPostClick, onShareWorkClick, userCircles, onQuoteClick }: {
    userProfile: UserProfile,
    onPostCreated: () => void;
    onDravyaPostClick: () => void;
    onShareWorkClick: (type: 'book' | 'case-study' | 'article' | 'aushadhi') => void;
    userCircles: Circle[];
    onQuoteClick: (text: string, range: Range) => void;
}) => {
    const [editor, setEditor] = React.useState<Editor | null>(null);
    const [content, setContent] = React.useState('');
    const [selectedCircle, setSelectedCircle] = React.useState('public');

    const handlePost = async () => {
        if (!content || content === '<p></p>') return;
        const newPost: Omit<Post, 'id' | 'createdAt' | 'author'> = {
            postType: 'thought',
            author: userProfile as any,
            content: content,
            circleId: selectedCircle === 'public' ? undefined : selectedCircle,
        };
        await addPost(newPost);
        setContent('');
        editor?.commands.clearContent();
        onPostCreated();
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-start gap-3">
                <Avatar>
                    <AvatarImage src={userProfile.avatarUrl} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 border rounded-md min-h-[80px]">
                    <div className="p-2">
                        <RichTextEditor
                            id="post-creator"
                            content={content}
                            onChange={setContent}
                            setEditorInstance={(id, editorInstance) => setEditor(editorInstance)}
                            removeEditorInstance={() => setEditor(null)}
                            placeholder="Share a thought, case, or question..."
                            onNewQuoteFound={onQuoteClick}
                        />
                    </div>
                </div>
                </div>
            </CardHeader>
             <CardFooter className="flex justify-between items-center">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create a Smart Post
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={onDravyaPostClick}><Leaf className="mr-2 h-4 w-4" />Post a Drug</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShareWorkClick('case-study')}><Microscope className="mr-2 h-4 w-4" />Post a Case</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => onShareWorkClick('book')}><BookOpen className="mr-2 h-4 w-4"/>Post a Work</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                 <div className="flex items-center gap-2">
                     <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Post to Public</SelectItem>
                            {userCircles.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button className="bg-ayurveda-green hover:bg-ayurveda-green/90" onClick={handlePost}>
                        <Send className="mr-2 h-4 w-4" /> Post
                    </Button>
                 </div>
            </CardFooter>
        </Card>
    )
};


function WallPageClient({ posts: initialPosts, userProfile, userCircles, discussions: initialDiscussions }: WallPageClientProps) {
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);
    const [discussions, setDiscussions] = useState(initialDiscussions);
    const [posts, setPosts] = useState(initialPosts || []);
    const [isDravyaDialogOpen, setIsDravyaDialogOpen] = useState(false);
    const [isShareWorkOpen, setIsShareWorkOpen] = useState(false);
    const [shareWorkType, setShareWorkType] = useState<'book' | 'case-study' | 'article' | 'aushadhi'>('book');
    const [isShareTextSnippetOpen, setIsShareTextSnippetOpen] = useState(false);
    const [textSnippet, setTextSnippet] = useState('');

    const [isQuoteDialogOpen, setIsQuoteDialogOpen] = React.useState(false);
    const [quoteDialogState, setQuoteDialogState] = React.useState<{ text: string, range: Range | null }>({ text: '', range: null });
    const [quoteCategories, setQuoteCategories] = React.useState<QuoteCategory[]>([]);
    const [selectedText, setSelectedText] = useState('');
    const [isCitationDialogOpen, setIsCitationDialogOpen] = useState(false);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isManthanaDialogOpen, setIsManthanaDialogOpen] = useState(false);
    const [activePostId, setActivePostId] = useState<string | null>(null);

    const { toast } = useToast();

    const fetchPosts = useCallback(async () => {
        const updatedPosts = await getPosts();
        setPosts(updatedPosts);
    }, []);

    React.useEffect(() => {
        getQuoteData().then(setQuoteCategories);
    }, []);

    const fetchDiscussions = async () => {
        const updatedDiscussions = await getDiscussions();
        setDiscussions(updatedDiscussions);
    };

    const handleQuestionPosted = () => {
        setIsAskModalOpen(false);
        fetchDiscussions();
    };

    const handleQuoteClick = (text: string, range: Range) => {
        setQuoteDialogState({ text, range });
        setIsQuoteDialogOpen(true);
    };

    const handleQuoteCreated = (newQuote?: QuoteType) => {
        if (!newQuote) return;
        toast({
            title: "Quote created!",
            description: "The new quote has been saved to your library."
        })
    };

    const onPostCreated = () => {
       fetchPosts();
    }

     const handlePostUpdate = (updatedPost: Post) => {
        setPosts(prevPosts =>
            prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
        );
    };
    
    const publicPosts = posts.filter(p => !p.circleId);
    const clinicalCircles = userCircles.filter(c => c.category === 'clinical');
    const shastraCircles = userCircles.filter(c => c.category === 'shastra');
    const institutionalCircles = userCircles.filter(c => c.category === 'institutional');

     const handleTextSelection = useCallback((text: string) => {
        if (text) setSelectedText(text);
    }, []);

    const handleSaveCitation = () => setIsCitationDialogOpen(true);
    const handleAddComment = () => setIsCommentDialogOpen(true);

     const handleRequestManthana = (postId: string) => {
        setActivePostId(postId);
        setIsManthanaDialogOpen(true);
    };
    
    const handlePostToWall = (text: string) => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim() || '';
        if (selectedText) {
          setTextSnippet(selectedText);
          setIsShareTextSnippetOpen(true);
        } else {
          toast({
            title: "No Text Selected",
            description: "Please select some text to post to the wall.",
            variant: "destructive"
          });
        }
      };
    
    const onAddComment = () => { //dummy function
        
    }

    return (
        <div>
            <Dialog open={isAskModalOpen} onOpenChange={setIsAskModalOpen}>
                <Tabs defaultValue="feed">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4" />My Feed</TabsTrigger>
                            <TabsTrigger value="circles"><Users className="mr-2 h-4 w-4"/>Circle Posts</TabsTrigger>
                            <TabsTrigger value="discussions">Discussions</TabsTrigger>
                        </TabsList>
                        <DialogTrigger asChild>
                            <Button>Ask a Question</Button>
                        </DialogTrigger>
                    </div>

                    <TabsContent value="feed">
                        <PostCreatorCard 
                            userProfile={userProfile} 
                            onPostCreated={onPostCreated}
                            onDravyaPostClick={() => setIsDravyaDialogOpen(true)}
                            onShareWorkClick={(type) => {
                                setShareWorkType(type);
                                setIsShareWorkOpen(true);
                            }}
                            userCircles={userCircles}
                            onQuoteClick={handleQuoteClick}
                        />
                        <div className="space-y-4">
                            {publicPosts.map(post => 
                                <PostCard 
                                    key={post.id} 
                                    post={post}
                                    userProfile={userProfile}
                                    onPostUpdate={handlePostUpdate} 
                                    onSelectText={handleTextSelection}
                                    onSaveCitation={handleSaveCitation}
                                    onAddComment={onAddComment}
                                    onCreateQuote={() => setIsQuoteDialogOpen(true)}
                                    onRequestManthana={() => handleRequestManthana(post.id)}
                                    onPostToWall={handlePostToWall}
                                    onPostDeleted={fetchPosts}
                                />
                            )}
                        </div>
                    </TabsContent>
                    
                     <TabsContent value="circles">
                        <Tabs defaultValue="clinical" className="w-full">
                           <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="clinical"><Stethoscope className="mr-2 h-4 w-4" />Clinical</TabsTrigger>
                                <TabsTrigger value="shastra"><BookOpen className="mr-2 h-4 w-4" />Shastra</TabsTrigger>
                                <TabsTrigger value="institutional"><Building className="mr-2 h-4 w-4" />Institutional</TabsTrigger>
                            </TabsList>
                            <TabsContent value="clinical" className="mt-4">
                                {clinicalCircles.length > 0 ? clinicalCircles.map(c => <p key={c.id}>{c.name}</p>) : <p>No clinical circles.</p>}
                            </TabsContent>
                            <TabsContent value="shastra" className="mt-4">
                               {shastraCircles.length > 0 ? shastraCircles.map(c => <p key={c.id}>{c.name}</p>) : <p>No shastra circles.</p>}
                            </TabsContent>
                            <TabsContent value="institutional" className="mt-4">
                                {institutionalCircles.length > 0 ? institutionalCircles.map(c => <p key={c.id}>{c.name}</p>) : <p>No institutional circles.</p>}
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="discussions">
                        <DiscussionList initialDiscussions={discussions} />
                    </TabsContent>
                </Tabs>
                 <DialogContent className="max-w-4xl max-h-[90vh]">
                    <AskQuestionForm onSuccess={handleQuestionPosted} />
                </DialogContent>
            </Dialog>

            <DravyagunaPostDialog 
                open={isDravyaDialogOpen} 
                onOpenChange={setIsDravyaDialogOpen} 
                onPostCreated={onPostCreated} 
                userCircles={userCircles}
            />
             <ShareWorkDialog 
                open={isShareWorkOpen} 
                onOpenChange={setIsShareWorkOpen} 
                onPostCreated={onPostCreated} 
                filter={shareWorkType} 
                userCircles={userCircles}
            />
            <ShareWorkDialog
                open={isShareTextSnippetOpen}
                onOpenChange={setIsShareTextSnippetOpen}
                onPostCreated={onPostCreated}
                userCircles={userCircles}
                workHtmlContent={selectedText}
                isTextSnippet={true}
            />
            <CreateQuoteDialog
                open={isQuoteDialogOpen}
                onOpenChange={setIsQuoteDialogOpen}
                onQuoteCreated={handleQuoteCreated}
                initialQuote={quoteDialogState.text}
                categories={quoteCategories}
            />
             <UserCitationDialog
                open={isCitationDialogOpen}
                onOpenChange={setIsCitationDialogOpen}
                sanskritText={selectedText}
                source={{ name: `Post by ${userProfile.name}`, location: `Wall`}}
            />
             <CommentFormDialog
                open={isCommentDialogOpen}
                onOpenChange={setIsCommentDialogOpen}
                targetText={selectedText}
                articleInfo={{ bookId: 'wall-posts', chapterId: 'general', verse: 'post-id' }} // Placeholder
            />
            {activePostId && (
                <RequestManthanaDialog
                    open={isManthanaDialogOpen}
                    onOpenChange={setIsManthanaDialogOpen}
                    discussionId={activePostId}
                    initialPurvapaksha={selectedText}
                />
            )}
        </div>
    );
};

export default function WallPage() {
    const [data, setData] = useState<{
        posts: Post[];
        userProfile: UserProfile | null;
        userCircles: Circle[];
        discussions: Discussion[];
    } | null>(null);

    const fetchData = useCallback(async () => {
        const [userProfile, posts, userCircles, discussions] = await Promise.all([
            getUserProfile(),
            getPosts(),
            getCirclesForUser('researcher@medhayu.com'),
            getDiscussions(),
        ]);
        setData({ userProfile, posts, userCircles, discussions });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!data || !data.userProfile) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="medhayu-module-container">
            <WallPageClient
                posts={data.posts || []}
                userProfile={data.userProfile}
                userCircles={data.userCircles || []}
                discussions={data.discussions || []}
            />
        </div>
    );
}


    