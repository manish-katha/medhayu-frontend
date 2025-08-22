
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/services/post.service';
import type { Book, UserProfile, StandaloneArticle, Bookmark as BookmarkType, Discussion } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Repeat, BookOpen, Quote, TrendingUp, Rss, Plus, ChevronDown, Pin, PinOff, X, FileText, Library } from 'lucide-react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { ScholarlyBubbleMenu } from '@/components/admin/editor/bubble-menus';
import { Badge } from '@/components/ui/badge';
import { CreateQuoteDialog } from '@/components/admin/quote-forms';
import { ShareWorkDialog } from '@/components/medhayu/wall/ShareWorkDialog';
import { getQuoteData } from '@/services/quote.service';
import { getCitationData } from '@/services/citation.service';
import { getDiscussions } from '@/services/discussion.service';
import StatCard from '@/components/Patients/Profile/StatCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const OverviewDashboard = dynamic(() => import('./OverviewDashboard'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[500px]" />,
});


interface OverviewTabProps {
  posts: Post[];
  userProfile: UserProfile;
  allBooks: Book[];
  allStandaloneArticles: StandaloneArticle[];
  bookmarks: BookmarkType[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
    userProfile, posts, allBooks, allStandaloneArticles, bookmarks 
}) => {
    const [quoteCount, setQuoteCount] = React.useState(0);
    const [citationCount, setCitationCount] = React.useState(0);
    const [discussionCount, setDiscussionCount] = React.useState(0);
    const [isQuoteDialogOpen, setIsQuoteDialogOpen] = React.useState(false);
    const [isShareWorkOpen, setIsShareWorkOpen] = React.useState(false);

    React.useEffect(() => {
        getQuoteData().then(data => setQuoteCount(data.reduce((acc, cat) => acc + (cat.quotes?.length || 0), 0)));
        getCitationData().then(data => setCitationCount(data.reduce((acc, cat) => acc + (cat.citations?.length || 0), 0)));
        getDiscussions().then(data => setDiscussionCount(data.length));
    }, []);

    const handleQuoteCreated = (newQuote?: Quote) => {
        console.log("Quote created, needs insertion logic", newQuote);
    };

    const handleWorkSelected = (work: Book | StandaloneArticle) => {
        console.log('Work selected:', work);
    }
    
    return (
       <>
         <CreateQuoteDialog
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          onQuoteCreated={handleQuoteCreated}
          categories={[]}
        />
        <ShareWorkDialog
            open={isShareWorkOpen}
            onOpenChange={setIsShareWorkOpen}
            onWorkSelected={handleWorkSelected}
        />
        <OverviewDashboard
            userProfile={userProfile}
            posts={posts}
            allBooks={allBooks}
            allStandaloneArticles={allStandaloneArticles}
            quoteCount={quoteCount}
            citationCount={citationCount}
            discussionCount={discussionCount}
            onQuoteClick={() => setIsQuoteDialogOpen(true)}
            onShareWorkClick={() => setIsShareWorkOpen(true)}
        />
       </>
    );
};

export default OverviewTab;
