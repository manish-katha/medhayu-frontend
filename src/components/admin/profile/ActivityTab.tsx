
'use client';

import React, { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/services/post.service';
import { UserProfile } from '@/types/user.types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Repeat, BookOpen, Quote } from 'lucide-react';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { ScholarlyBubbleMenu } from '@/components/admin/editor/bubble-menus';

interface ActivityTabProps {
  posts: Post[];
  userProfile: UserProfile;
}

// This component is being deprecated and its contents moved to OverviewTab.
// It will be removed in a future commit.
const ActivityTab: React.FC<ActivityTabProps> = ({ posts, userProfile }) => {
  return <div>This tab has been merged into the Overview tab.</div>
};

export default ActivityTab;
