
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/services/post.service';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Repeat, Leaf, Bookmark, BookOpen } from 'lucide-react';
import Image from 'next/image';

const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex items-start">
        <div className="w-24 text-sm font-semibold text-muted-foreground">{label}:</div>
        <div className="flex-1 text-sm">{value}</div>
    </div>
);

const ReactionButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
        {icon}
        {label}
    </Button>
);

export const DravyaPostCard = ({ post }: { post: Post }) => {
    const { author, createdAt, dravyaData } = post;
    if (!dravyaData) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{author.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                    {dravyaData.imageUrl && (
                        <div className="w-full sm:w-1/3 flex-shrink-0">
                            <div className="aspect-square relative rounded-md bg-muted overflow-hidden">
                                <Image src={dravyaData.imageUrl} alt={dravyaData.name} layout="fill" objectFit="cover" />
                            </div>
                        </div>
                    )}
                    <div className="flex-1 space-y-3">
                        <CardTitle className="text-xl flex items-center gap-2 text-ayurveda-green">
                            <Leaf />
                            {dravyaData.name} ({dravyaData.botanicalName})
                        </CardTitle>
                        <div className="space-y-2 text-sm border-t pt-3 mt-3">
                            <InfoRow label="Rasa" value={dravyaData.rasa?.join(', ')} />
                            <InfoRow label="Guna" value={dravyaData.guna?.join(', ')} />
                            <InfoRow label="Veerya" value={dravyaData.veerya} />
                            <InfoRow label="Vipaka" value={dravyaData.vipaka} />
                            <InfoRow label="Prabhava" value={dravyaData.prabhava} />
                            <InfoRow label="Karma" value={dravyaData.karma} />
                            <InfoRow label="Part Used" value={dravyaData.partUsed} />
                            <InfoRow label="Formulations" value={dravyaData.formulationUse} />
                        </div>
                    </div>
                </div>
                 {dravyaData.discussion && (
                    <div className="mt-4 pt-4 border-t">
                         <div 
                            className="prose prose-sm dark:prose-invert max-w-none" 
                            dangerouslySetInnerHTML={{ __html: dravyaData.discussion }} 
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t pt-2 flex justify-around">
                <ReactionButton icon={<Heart size={16} />} label="Appreciate" />
                <ReactionButton icon={<MessageSquare size={16} />} label="Discuss" />
                <ReactionButton icon={<Bookmark size={16} />} label="Save" />
                <ReactionButton icon={<ThumbsUp size={16} />} label="Tried This" />
                <ReactionButton icon={<BookOpen size={16} />} label="Add to Notes" />
            </CardFooter>
        </Card>
    );
};
