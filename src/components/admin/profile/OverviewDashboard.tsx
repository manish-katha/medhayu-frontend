
'use client';

import React, { useState, useEffect } from 'react';
import GridLayout, { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/services/post.service';
import type { Book, UserProfile, StandaloneArticle } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Repeat, BookOpen, Quote as QuoteIcon, TrendingUp, Rss, Plus, ChevronDown, Pin, PinOff, X, FileText, Library, BarChart2 } from 'lucide-react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { ScholarlyBubbleMenu } from '@/components/admin/editor/bubble-menus';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/Patients/Profile/StatCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Editor } from '@tiptap/react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface OverviewDashboardProps {
  userProfile: UserProfile;
  posts: Post[];
  allBooks: Book[];
  allStandaloneArticles: StandaloneArticle[];
  quoteCount: number;
  citationCount: number;
  discussionCount: number;
  onQuoteClick: () => void;
  onShareWorkClick: () => void;
}

const PostCard = ({ post }: { post: Post }) => (
    <Card>
        <CardHeader>
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
        </CardHeader>
        <CardContent>
            <div 
                className="prose prose-sm dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />
        </CardContent>
        <CardFooter className="border-t pt-2 flex justify-around">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground"><ThumbsUp size={16}/>Like</Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground"><MessageSquare size={16}/>Comment</Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground"><Repeat size={16}/>Repost</Button>
        </CardFooter>
    </Card>
);

const PostCreatorCard = ({ userProfile, onQuoteClick, onShareWorkClick }: {
    userProfile: UserProfile,
    onQuoteClick: () => void,
    onShareWorkClick: () => void,
}) => {
    const [editor, setEditor] = React.useState<Editor | null>(null);
    const [content, setContent] = React.useState('');

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start gap-3">
                <Avatar>
                    <AvatarImage src={userProfile.avatarUrl} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 border rounded-md min-h-[80px]">
                    {editor && <ScholarlyBubbleMenu editor={editor} onNoteButtonClick={() => {}} onQuoteClick={() => {}} onCitationClick={() => {}} onAddComment={() => {}} />}
                    <div className="p-2">
                        <RichTextEditor
                            id="post-creator"
                            content={content}
                            onChange={setContent}
                            setEditorInstance={(id, editorInstance) => setEditor(editorInstance)}
                            placeholder="Share a thought, case, or question..."
                        />
                    </div>
                </div>
                </div>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2 mt-auto">
                <Button variant="outline" onClick={onQuoteClick}><QuoteIcon className="mr-2 h-4 w-4"/>Add Quote</Button>
                <Button variant="outline" onClick={onShareWorkClick}><BookOpen className="mr-2 h-4 w-4"/>Share Work</Button>
                <Button className="bg-ayurveda-green hover:bg-ayurveda-green/90">Post</Button>
            </CardFooter>
        </Card>
    )
};

const ActivityFeedCard = ({ posts }: { posts: Post[] }) => (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Rss size={18} /> Activity Feed
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
             <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
             </ScrollArea>
        </CardContent>
    </Card>
);

const TrendingTopicsCard = () => {
    const topics = ['#Amavata', '#Panchakarma', '#CharakaSutra', '#Rasayana', '#Kayachikitsa'];
    return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp size={18} /> Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topics.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
          </CardContent>
        </Card>
    )
};

const DiscussionStatsCard = ({ discussionCount }: { discussionCount: number }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart2 size={18} /> Discussion Stats
      </CardTitle>
    </CardHeader>
    <CardContent>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>Questions</span> <span className="font-bold">{discussionCount}</span>
            </div>
            <div className="flex justify-between">
                <span>Answers</span> <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between">
                <span>Best Answers</span> <span className="font-bold">0</span>
            </div>
             <div className="flex justify-between">
                <span>Users</span> <span className="font-bold">2</span>
            </div>
        </div>
    </CardContent>
  </Card>
);


const allWidgets = {
    'stat-books': { w: 3, h: 2, content: (props: any) => <StatCard title="Books Authored" value={props.allBooks.length} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} />, name: "Books Stat" },
    'stat-articles': { w: 3, h: 2, content: (props: any) => <StatCard title="Articles Published" value={props.allStandaloneArticles.length} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />, name: "Articles Stat" },
    'stat-quotes': { w: 3, h: 2, content: (props: any) => <StatCard title="Quotes Curated" value={props.quoteCount} icon={<QuoteIcon className="h-4 w-4 text-muted-foreground" />} />, name: "Quotes Stat" },
    'stat-citations': { w: 3, h: 2, content: (props: any) => <StatCard title="Citations Managed" value={props.citationCount} icon={<Library className="h-4 w-4 text-muted-foreground" />} />, name: "Citations Stat" },
    'post-creator': { w: 12, h: 4, content: (props: any) => <PostCreatorCard {...props} />, name: "Post Creator" },
    'activity-feed': { w: 8, h: 8, content: (props: any) => <ActivityFeedCard {...props} />, name: "Activity Feed" },
    'trending-topics': { w: 4, h: 8, content: () => <TrendingTopicsCard />, name: "Trending Topics" },
    'discussion-stats': { w: 4, h: 4, content: (props: any) => <DiscussionStatsCard {...props} />, name: "Discussion Stats"},
};

const defaultLayouts: { [key: string]: Layout[] } = {
    lg: [
        { i: 'stat-books', x: 0, y: 0, w: 3, h: 2, isResizable: true },
        { i: 'stat-articles', x: 3, y: 0, w: 3, h: 2, isResizable: true },
        { i: 'stat-quotes', x: 6, y: 0, w: 3, h: 2, isResizable: true },
        { i: 'stat-citations', x: 9, y: 0, w: 3, h: 2, isResizable: true },
        { i: 'post-creator', x: 0, y: 2, w: 12, h: 4, isResizable: true },
        { i: 'activity-feed', x: 0, y: 6, w: 8, h: 8, isResizable: true },
        { i: 'trending-topics', x: 8, y: 6, w: 4, h: 8, isResizable: true },
        { i: 'discussion-stats', x: 8, y: 14, w: 4, h: 4, isResizable: true },
    ]
};


const OverviewDashboard: React.FC<OverviewDashboardProps> = (props) => {
    const [layouts, setLayouts] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLayout = localStorage.getItem('medhayuDashboardLayouts');
            if (savedLayout) return JSON.parse(savedLayout);
        }
        return defaultLayouts;
    });

    const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
         if (typeof window !== 'undefined') {
            const savedWidgets = localStorage.getItem('medhayuDashboardWidgets');
            if (savedWidgets) return JSON.parse(savedWidgets);
        }
        return Object.keys(allWidgets);
    });

    const onLayoutChange = (_: Layout[], newLayouts: { [key: string]: Layout[] }) => {
        setLayouts(newLayouts);
        localStorage.setItem('medhayuDashboardLayouts', JSON.stringify(newLayouts));
    };

    const togglePin = (widgetId: string) => {
        const newLayouts = JSON.parse(JSON.stringify(layouts));
        Object.keys(newLayouts).forEach(breakpoint => {
            const item = newLayouts[breakpoint].find((l: any) => l.i === widgetId);
            if(item) item.static = !item.static;
        });
        setLayouts(newLayouts);
    }
    
    const removeWidget = (widgetId: string) => {
        const newWidgets = activeWidgets.filter(id => id !== widgetId);
        setActiveWidgets(newWidgets);
        localStorage.setItem('medhayuDashboardWidgets', JSON.stringify(newWidgets));
    };

    const addWidget = (widgetId: string) => {
        if (activeWidgets.includes(widgetId)) return;
        const newWidgets = [...activeWidgets, widgetId];
        setActiveWidgets(newWidgets);
        
        const newLayouts = JSON.parse(JSON.stringify(layouts));
        const widgetConfig = (allWidgets as any)[widgetId];
        Object.keys(newLayouts).forEach(breakpoint => {
            const maxY = Math.max(0, ...newLayouts[breakpoint].map((l: Layout) => l.y + l.h));
            newLayouts[breakpoint].push({ i: widgetId, x: 0, y: maxY, ...widgetConfig });
        });
        setLayouts(newLayouts);
    }
    
    const availableWidgets = Object.keys(allWidgets).filter(id => !activeWidgets.includes(id));

    const WidgetMenu = ({ widgetId }: { widgetId: string }) => {
        const isStatic = layouts.lg?.find((l: any) => l.i === widgetId)?.static || false;
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10 opacity-50 hover:opacity-100">
                        <Pin size={14} className={cn("text-muted-foreground", isStatic && "text-primary fill-primary")} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePin(widgetId)}>
                        {isStatic ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                        <span>{isStatic ? 'Unpin' : 'Pin'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => removeWidget(widgetId)} className="text-destructive">
                        <X className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

  return (
    <div>
        <div className="flex justify-end mb-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Widget <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {availableWidgets.length > 0 ? availableWidgets.map(id => (
                        <DropdownMenuItem key={id} onClick={() => addWidget(id)}>
                           {(allWidgets as any)[id].name}
                        </DropdownMenuItem>
                    )) : (
                        <DropdownMenuItem disabled>All widgets displayed</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
        <ResponsiveGridLayout
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={40}
            compactType="vertical"
            isDraggable={true}
            isResizable={true}
            preventCollision={false}
            margin={[16, 16]}
        >
        {activeWidgets.map(key => (
            <div key={key} className="relative">
                <WidgetMenu widgetId={key} />
                {(allWidgets as any)[key].content(props)}
            </div>
        ))}
        </ResponsiveGridLayout>
    </div>
  );
}

export default OverviewDashboard;
