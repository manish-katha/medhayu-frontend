'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getDiscoverableUsers } from '@/services/user.service';
import type { UserProfile } from '@/types/user.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, List, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TagInput } from '@/components/ui/tag-input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const UserCard = ({ user }: { user: UserProfile }) => (
    <Link href={`/medhayu/profile/${user.username}`} className="block">
        <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
            <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.career_stage} at {user.college}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                        {user.interests.slice(0, 3).map(interest => (
                            <Badge key={interest} variant="outline">{interest}</Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
);

const UserListItem = ({ user }: { user: UserProfile }) => (
    <Link href={`/medhayu/profile/${user.username}`} className="block">
        <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-md transition-colors">
            <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.career_stage} at {user.college}</p>
            </div>
            <div className="flex-1 hidden md:block">
                <div className="flex flex-wrap gap-1">
                    {user.interests.slice(0, 3).map(interest => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                </div>
            </div>
        </div>
    </Link>
);


export default function DiscoverPeoplePage() {
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTags, setSearchTags] = useState<string[]>([]);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        getDiscoverableUsers().then(users => {
            setAllUsers(users);
            setIsLoading(false);
        });
    }, []);

    const filteredUsers = useMemo(() => {
        if (searchTags.length === 0) {
            return allUsers;
        }

        return allUsers.filter(user => {
            return searchTags.every(tag => {
                const lowerCaseTag = tag.toLowerCase();
                const userFields = [
                    user.name,
                    user.email,
                    user.bio,
                    user.college,
                    user.year_passed,
                    user.city,
                    user.state,
                    user.career_stage,
                    user.approach,
                    ...(user.department || []),
                    ...(user.interests || []),
                    ...(user.skills || []),
                    ...(user.circles || []),
                ].map(field => String(field).toLowerCase());

                return userFields.some(field => field.includes(lowerCaseTag));
            });
        });
    }, [allUsers, searchTags]);

    return (
        <div className="medhayu-module-container space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Discover People</h1>
                    <p className="text-muted-foreground">Find and connect with Ayurveda professionals, scholars, and students.</p>
                </div>
                 <ToggleGroup type="single" value={view} onValueChange={(v) => { if(v) setView(v as any); }}>
                    <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="smart-search">🧠 Smart Tag-Based Search</Label>
                <p className="text-sm text-muted-foreground">
                    Type or paste anything about the doctor you want to find, separated by commas.
                </p>
                <div className="flex items-center gap-2">
                    <TagInput
                        id="smart-search"
                        value={searchTags}
                        onChange={setSearchTags}
                        placeholder="e.g., Oshadham wellness, Kathua, 2015, Shalya Tantra..."
                        className="flex-grow"
                    />
                    <Button variant="ghost" onClick={() => setSearchTags([])} disabled={searchTags.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                    </div>
                ) : filteredUsers.length > 0 ? (
                    view === 'grid' ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map(user => (
                                <UserCard key={user.email} user={user} />
                            ))}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <div className="space-y-2">
                                {filteredUsers.map((user, index) => (
                                    <React.Fragment key={user.email}>
                                        <UserListItem user={user} />
                                        {index < filteredUsers.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    <EmptyState 
                        icon={<Users />}
                        title="No People Found"
                        description="Try adjusting your search tags to find people in the community."
                        action={{ label: "Clear All Tags", onClick: () => setSearchTags([]) }}
                    />
                )}
            </div>
        </div>
    );
}
