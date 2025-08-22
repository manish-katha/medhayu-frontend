
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenSquare, Book, UserCircle, Users, Bookmark, FileText as ArticleIcon, Calendar, BadgeCheck, User, Download } from 'lucide-react';
import Image from 'next/image';
import type { Book as BookType, Bookmark as BookmarkType, Circle } from '@/types/book';
import type { StandaloneArticle } from '@/types/article';
import type { PatientData } from '@/types/patient';
import type { Post } from '@/services/post.service';
import type { UserProfile } from '@/types/user.types';
import AboutTab from './AboutTab';
import BooksTab from './BooksTab';
import ArticlesTab from './ArticlesTab';
import BookmarksTab from './BookmarksTab';
import CirclesTab from './CirclesTab';
import OverviewTab from './OverviewTab';
import { getQuoteData } from '@/services/quote.service';
import { getCitationData } from '@/services/citation.service';
import { getDiscussions } from '@/services/discussion.service';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ProfileResumeView } from './ProfileResumeView';
import html2pdf from 'html2pdf.js';

const ProfileBadge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <Badge variant="outline" className="rounded-full py-1 px-3 border-ayurveda-terracotta/50 bg-ayurveda-terracotta/10 text-ayurveda-terracotta">
        {icon}
        <span className="ml-2 font-medium">{text}</span>
    </Badge>
);

interface ProfileClientPageProps {
    userProfile: UserProfile;
    bookmarks: BookmarkType[];
    allBooks: BookType[];
    posts: Post[];
    userCircles: Circle[];
    discoverableUsers: UserProfile[];
    allStandaloneArticles: StandaloneArticle[];
    patientDetails?: PatientData | null;
}

export function ProfileClientPage({
    userProfile,
    bookmarks,
    allBooks,
    posts,
    userCircles,
    discoverableUsers,
    allStandaloneArticles,
}: ProfileClientPageProps) {
    const [isResumeOpen, setIsResumeOpen] = useState(false);

    const handleDownloadPdf = () => {
        const element = document.getElementById('profile-resume-content');
        const opt = {
            margin: 0.5,
            filename: `${userProfile.name.replace(/\s+/g, '_')}_Profile.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };
    
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-0">
                    <div className="relative h-48 bg-muted/30">
                        <Image src={userProfile.coverUrl} alt="Cover Photo" layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint="abstract texture" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 items-start p-6 pb-4 -mt-20">
                        <div className="relative flex-shrink-0">
                             <Avatar className="h-32 w-32 border-4 border-background bg-card shadow-lg">
                                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                                <AvatarFallback className="text-3xl">{userProfile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 mt-16">
                            <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                            <CardDescription>{userProfile.experience[0]?.title || 'Ayurveda Enthusiast'}</CardDescription>
                            <p className="mt-2 text-sm text-muted-foreground">{userProfile.bio}</p>
                        </div>
                        <div className="mt-16 flex gap-2">
                             <Button variant="outline"><PenSquare className="mr-2 h-4 w-4"/>Edit Profile</Button>
                             <Button variant="outline" onClick={() => setIsResumeOpen(true)}>
                                <Download className="mr-2 h-4 w-4" /> Download Profile
                            </Button>
                        </div>
                    </div>
                    <div className="px-6 pb-4 border-b">
                         <div className="flex items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">{userProfile.college}</h3>
                                <p className="text-sm text-muted-foreground">{userProfile.education[0]?.degree} ({userProfile.education[0]?.endYear})</p>
                            </div>
                            <Separator orientation="vertical" className="h-10"/>
                             <div>
                                <h3 className="font-semibold text-lg">{userProfile.experience[0]?.company}</h3>
                                <p className="text-sm text-muted-foreground">{userProfile.experience[0]?.title}</p>
                            </div>
                         </div>
                         <div className="flex flex-wrap gap-2 mt-4">
                            {userProfile.skills.slice(0, 5).map(skill => (
                                <ProfileBadge key={skill} icon={<BadgeCheck size={14} />} text={skill} />
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                     <Tabs defaultValue="overview">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview"><UserCircle className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                            <TabsTrigger value="about"><User className="mr-2 h-4 w-4" />About</TabsTrigger>
                            <TabsTrigger value="books"><Book className="mr-2 h-4 w-4" />Works</TabsTrigger>
                            <TabsTrigger value="circles"><Users className="mr-2 h-4 w-4" />Circles</TabsTrigger>
                            <TabsTrigger value="articles"><ArticleIcon className="mr-2 h-4 w-4" />Articles</TabsTrigger>
                        </TabsList>
                         <TabsContent value="overview" className="p-6">
                            <OverviewTab 
                                userProfile={userProfile} 
                                posts={posts} 
                                allBooks={allBooks}
                                allStandaloneArticles={allStandaloneArticles}
                                bookmarks={bookmarks}
                            />
                        </TabsContent>
                         <TabsContent value="about" className="p-6">
                            <AboutTab userProfile={userProfile} />
                        </TabsContent>
                        <TabsContent value="books" className="p-6">
                             <BooksTab books={allBooks} />
                        </TabsContent>
                        <TabsContent value="articles" className="p-6">
                             <ArticlesTab articles={allStandaloneArticles} />
                        </TabsContent>
                        <TabsContent value="circles" className="p-6">
                             <CirclesTab circles={userCircles} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Profile Preview</DialogTitle>
                        <DialogDescription>A resume-style overview of {userProfile.name}'s profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto bg-muted">
                        <ProfileResumeView profile={userProfile} />
                    </div>
                    <DialogFooter className="p-4 border-t">
                        <Button variant="outline" onClick={() => setIsResumeOpen(false)}>Close</Button>
                        <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" /> Download as PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
