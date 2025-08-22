
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import type { Editor } from '@tiptap/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, StickyNote, X as XIcon, Loader2, BookOpen, NotebookText, Quote, Globe, Users, History, MessageSquare, CheckCircle2, CornerDownRight, Pencil, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Citation, Book, ContentBlock, GlossaryTerm, Quote as QuoteType, GlossaryCategory, Article as ArticleType, Comment, Chapter } from '@/types';
import { searchCitations } from '@/services/citation.service';
import { getBooks } from '@/services/book.service';
import { getGlossaryData } from '@/services/glossary.service';
import { suggestQuotesForArticle } from '@/actions/quote.actions';
import { useDebounce } from '@/hooks/use-debounce';
import { suggestCitationsForArticle, type SuggestionWithContext } from '@/ai/flows/suggest-contextual-citations';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Link from 'next/link';
import { ArticleTocDisplay } from './book-forms';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { handleAddReply, handleDeleteComment, handleUpdateComment } from '@/app/articles/actions';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useFormStatus } from 'react-dom';


function CitationList({
  citations,
  onInsert,
  isContextual = false,
}: {
  citations: (Citation | SuggestionWithContext)[];
  onInsert: (refId: string) => void;
  isContextual?: boolean;
}) {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-2">
      {citations.map(citation => {
        const isSuggestionWithContext = 'matchedKeyword' in citation;
        const uniqueKey = isSuggestionWithContext
          ? `${citation.refId}-${citation.matchedKeyword}`
          : citation.refId;

        return (
          <div key={uniqueKey} className="p-2 rounded-md hover:bg-muted">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {isSuggestionWithContext && citation.count > 1 && (
                   <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Sparkles className="h-4 w-4 sparkling-star mt-1 flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Frequently Used — Based on article context</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">
                    {isSuggestionWithContext 
                      ? <>{citation.matchedKeyword} <span className="text-muted-foreground font-normal">({citation.count} times)</span></>
                      : (citation.keywords[0] || citation.refId)
                    }
                  </span>
                  <p className="text-xs text-muted-foreground font-headline truncate" title={citation.sanskrit}>
                    {citation.sanskrit}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onInsert(citation.refId)} className="flex-shrink-0">
                Insert
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuoteList({
  quotes,
  onInsert,
}: {
  quotes: QuoteType[];
  onInsert: (quote: QuoteType) => void;
}) {
  if (quotes.length === 0) return null;

  return (
    <div className="space-y-2">
      {quotes.map(quote => (
        <div key={quote.id} className="p-2 rounded-md hover:bg-muted">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">{quote.title}</span>
              <p className="text-xs text-muted-foreground italic truncate" title={quote.quote}>
                “{quote.quote}”
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onInsert(quote)} className="flex-shrink-0">
              Insert
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}


function MyNotesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'books'>('saved');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'books') {
      setLoading(true);
      getBooks()
        .then(setBooks)
        .finally(() => setLoading(false));
    }
  }, [activeSubTab]);

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <ToggleGroup type="single" defaultValue="saved" value={activeSubTab} onValueChange={(value) => { if (value) setActiveSubTab(value as any) }} className="w-full grid grid-cols-2">
        <ToggleGroupItem value="saved" aria-label="Saved Notes">
          Saved Notes
        </ToggleGroupItem>
        <ToggleGroupItem value="books" aria-label="My Books">
          My Books
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'saved' && (
          <div className="text-sm text-muted-foreground text-center p-4 border-2 border-dashed rounded-lg h-full flex items-center justify-center flex-col">
            <p>Your saved notes will appear here.</p>
            <p className="text-xs mt-1">(Feature coming soon)</p>
          </div>
        )}
        {activeSubTab === 'books' && (
          loading ? (
             <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading books...</span>
            </div>
          ) : (
            books.length > 0 ? (
                <div className="space-y-1">
                    {books.map(book => (
                        <Link key={book.id} href={`/admin/books/${book.id}`} passHref>
                        <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 leading-snug">
                            {book.name}
                        </Button>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center p-4">No books found.</p>
            )
          )
        )}
      </div>
    </div>
  );
}

function SuggestTab({ editor }: { editor: Editor | null }) {
  const [query, setQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState<Citation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [contextualCitations, setContextualCitations] = useState<SuggestionWithContext[]>([]);
  const [isSuggestingCitations, setIsSuggestingCitations] = useState(false);

  const [contextualQuotes, setContextualQuotes] = useState<QuoteType[]>([]);
  const [isSuggestingQuotes, setIsSuggestingQuotes] = useState(false);

  const { toast } = useToast();

  const editorText = editor?.getText() || '';
  const debouncedEditorText = useDebounce(editorText, 1000);

  useEffect(() => {
    if (query.trim() === '') {
      setManualSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCitations(query);
      setManualSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!editor || debouncedEditorText.length < 50) {
      setContextualCitations([]);
      setContextualQuotes([]);
      return;
    }

    const getSuggestions = async () => {
      setIsSuggestingCitations(true);
      setIsSuggestingQuotes(true);
      try {
        const [citationResult, quoteResult] = await Promise.all([
            suggestCitationsForArticle({ articleText: debouncedEditorText }),
            suggestQuotesForArticle(debouncedEditorText)
        ]);
        setContextualCitations(citationResult.suggestions || []);
        setContextualQuotes(quoteResult || []);
      } catch (error) {
        console.error("AI suggestion error:", error);
      } finally {
        setIsSuggestingCitations(false);
        setIsSuggestingQuotes(false);
      }
    };
    getSuggestions();
  }, [debouncedEditorText, editor]);
  
  const handleInsert = (insertLogic: () => void) => {
    if (editor && editor.isFocused) {
      insertLogic();
    } else {
      toast({
        variant: 'destructive',
        title: "No Active Editor",
        description: "Please click into a content block to insert content.",
      });
    }
  };
  
  const handleInsertCitation = (refId: string) => {
      handleInsert(() => editor?.chain().focus().insertContent({ type: 'citation', attrs: { refId } }).run());
  };

  const handleInsertQuote = (quote: QuoteType) => {
    handleInsert(() => {
        editor?.chain().focus().insertContent({
            type: 'blockquote',
            attrs: { author: quote.author },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `“${quote.quote}”` }] }]
        }).run();
    });
  };

  const showManualSearch = query.trim().length > 0;

  return (
    <div className="p-4 flex-1 flex flex-col min-h-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search citations..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto mt-4 flex-1">
        {showManualSearch ? (
          <div className="space-y-2">
            <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Search Results</h4>
            {isSearching ? <p className="text-muted-foreground text-sm text-center p-4">Searching...</p> 
                         : manualSearchResults.length > 0 
                         ? <CitationList citations={manualSearchResults} onInsert={handleInsertCitation} />
                         : <p className="text-muted-foreground text-sm text-center p-4">No results found.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2"><Sparkles className="h-3 w-3" /> Citations</h4>
              {isSuggestingCitations ? <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Analyzing...</span></div> 
                           : contextualCitations.length > 0 
                           ? <CitationList citations={contextualCitations} onInsert={handleInsertCitation} isContextual={true} />
                           : <p className="text-muted-foreground text-sm text-center p-4">No citation suggestions.</p>}
            </div>
            <div>
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2"><Quote className="h-3 w-3" /> Quotes</h4>
              {isSuggestingQuotes ? <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Analyzing...</span></div>
                           : contextualQuotes.length > 0
                           ? <QuoteList quotes={contextualQuotes} onInsert={handleInsertQuote} />
                           : <p className="text-muted-foreground text-sm text-center p-4">No quote suggestions.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlossaryTab({
  activeGlossary,
  onActiveGlossaryChange,
}: {
  activeGlossary: GlossaryCategory | null;
  onActiveGlossaryChange: (category: GlossaryCategory | null) => void;
}) {
  const [categories, setCategories] = useState<GlossaryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlossaryData().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);
  
  const globalGlossaries = categories.filter(c => c.scope === 'global');
  const localGlossaries = categories.filter(c => c.scope === 'local');
  
  const handleRadioChange = (value: string) => {
    const found = categories.find(c => c.id === value);
    onActiveGlossaryChange(found || null);
  };
  
  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      if (!activeGlossary && categories.length > 0) {
        onActiveGlossaryChange(categories[0]);
      }
    } else {
      onActiveGlossaryChange(null);
    }
  };

  const colorClassMap: Record<string, string> = {
    saffron: 'bg-primary',
    blue: 'bg-info',
    green: 'bg-success',
    gray: 'bg-muted-foreground',
  };

  const isGlossaryModeOn = activeGlossary !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
            <Label htmlFor="glossary-mode-toggle" className="font-semibold">Glossary Highlighting</Label>
            <Switch
                id="glossary-mode-toggle"
                checked={isGlossaryModeOn}
                onCheckedChange={handleSwitchChange}
            />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0">
          <p className="text-sm text-muted-foreground mb-4">Select a glossary to highlight its terms in the text.</p>
          {loading ? (
               <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading glossaries...</span>
              </div>
          ) : (
             <RadioGroup 
                onValueChange={handleRadioChange} 
                value={activeGlossary?.id || ''}
                disabled={!isGlossaryModeOn}
                className={cn(!isGlossaryModeOn && "opacity-50")}
            >
                <ScrollArea className="pr-2">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4"/> Global Glossaries
                        </Label>
                        {globalGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={`intellicite-${cat.id}`} />
                                <Label htmlFor={`intellicite-${cat.id}`} className="flex items-center gap-2 cursor-pointer">
                                     <span className={cn("h-3 w-3 rounded-full", colorClassMap[cat.colorTheme])}></span>
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                         <Separator />
                         <Label className="flex items-center gap-2 text-muted-foreground">
                            Local Glossaries
                        </Label>
                         {localGlossaries.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={cat.id} id={`intellicite-${cat.id}`} />
                                <Label htmlFor={`intellicite-${cat.id}`} className="flex items-center gap-2 cursor-pointer">
                                    <span className={cn("h-3 w-3 rounded-full", colorClassMap[cat.colorTheme])}></span>
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
             </RadioGroup>
          )}
      </div>
    </div>
  );
}

// --- Collaboration Tab ---

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

function CollaborateTab({ articleInfo }: { 
    articleInfo: { bookId: string; chapter: Chapter; article: ArticleType } | null 
}) {
    const comments = articleInfo?.article?.comments || [];

    return (
        <div className="flex flex-col h-full">
            <Card className="m-4 bg-muted/50 flex-1 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Sahakāra Chakra
                    </CardTitle>
                    <CardDescription>Discussion threads for this article.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-25rem)]">
                        <div className="space-y-4 pr-4">
                            {comments.length > 0 ? (
                                comments.map(comment => (
                                    <CommentThread 
                                        key={comment.id}
                                        comment={comment}
                                        articleInfo={{ 
                                            bookId: articleInfo!.bookId, 
                                            chapterId: String(articleInfo!.chapter.id), 
                                            verse: String(articleInfo!.article.verse)
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-center text-muted-foreground p-8">No discussions started yet. Select text in the editor to add a comment.</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}


export function IntellicitePanel({
  tags,
  onTagsChange,
  editor,
  blocks,
  headerActions,
  activeGlossary,
  onActiveGlossaryChange,
  articleInfo,
}: {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  editor: Editor | null;
  blocks: Partial<ContentBlock>[];
  headerActions?: React.ReactNode;
  activeGlossary: GlossaryCategory | null;
  onActiveGlossaryChange: (category: GlossaryCategory | null) => void;
  articleInfo: { bookId: string; chapter: Chapter; article: ArticleType } | null;
}) {
  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newTag = event.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      event.currentTarget.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col h-full">
      {headerActions ? (
        <div className="p-4 border-b">{headerActions}</div>
        ) : (
        <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Intelligent Assistant</h3>
        </div>
      )}
      <Tabs defaultValue="outline" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-5 p-1 h-auto">
           <TabsTrigger value="outline" className="flex-col h-auto p-2 gap-1 text-xs">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:block">Outline</span>
          </TabsTrigger>
          <TabsTrigger value="suggest" className="flex-col h-auto p-2 gap-1 text-xs">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:block">Suggest</span>
          </TabsTrigger>
          <TabsTrigger value="collaborate" className="flex-col h-auto p-2 gap-1 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:block">Collaborate</span>
          </TabsTrigger>
           <TabsTrigger value="glossary" className="flex-col h-auto p-2 gap-1 text-xs">
            <NotebookText className="h-4 w-4" />
            <span className="hidden sm:block">Glossary</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-col h-auto p-2 gap-1 text-xs">
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:block">Notes</span>
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 flex flex-col min-h-0">
            <TabsContent value="outline" className="m-0 h-full flex flex-col">
              <div className="p-4 overflow-y-auto flex-1">
                <ArticleTocDisplay blocks={blocks} />
              </div>
            </TabsContent>
            <TabsContent value="suggest" className="m-0 flex-1 flex flex-col min-h-0">
                <SuggestTab editor={editor} />
                <div className="p-4 border-t space-y-2">
                    <label className="text-sm font-medium">Article Tags</label>
                    <p className="text-xs text-muted-foreground">Add keywords to categorize this article. Press Enter to add a new tag.</p>
                    <Input
                        placeholder="Add a tag..."
                        onKeyDown={handleTagInputKeyDown}
                    />
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onClick={() => handleRemoveTag(tag)}
                                        aria-label={`Remove ${tag} tag`}
                                    >
                                        <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="collaborate" className="m-0 h-full flex flex-col">
                <CollaborateTab articleInfo={articleInfo} />
            </TabsContent>
             <TabsContent value="glossary" className="m-0 h-full flex flex-col">
              <GlossaryTab 
                activeGlossary={activeGlossary}
                onActiveGlossaryChange={onActiveGlossaryChange}
              />
            </TabsContent>
            <TabsContent value="notes" className="m-0 h-full">
                <MyNotesTab />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
