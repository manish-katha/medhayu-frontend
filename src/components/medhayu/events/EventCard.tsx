
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/event';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const formattedDate = isSameDay(startDate, endDate)
        ? format(startDate, 'E, d MMM yyyy')
        : `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM, yyyy')}`;

    return (
        <Link href={`/medhayu/events/${event.id}`}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader className="p-0">
                    <div className="relative h-40">
                        <Image
                            src={event.posterUrl || 'https://placehold.co/800x400.png'}
                            alt={event.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-t-lg"
                        />
                        <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur-sm">{event.category}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2"><Calendar size={14} /> {formattedDate}</p>
                        <p className="flex items-center gap-2"><MapPin size={14} /> {event.location.type === 'Physical' ? event.location.address : 'Online Event'}</p>
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex items-center -space-x-2">
                             <Avatar className="h-6 w-6 border-2 border-background"><AvatarImage src={event.primaryAuthor.avatarUrl} /></Avatar>
                            {(event.collaborators || []).slice(0, 2).map(c => (
                                <Avatar key={c.id} className="h-6 w-6 border-2 border-background"><AvatarImage src={c.avatarUrl} /></Avatar>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users size={14} /> {event.rsvps.filter(r => r.status === 'attending').length} attending
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

// Dummy Avatar for placeholder
const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
const AvatarImage = ({ src }: { src?: string }) => src ? <img src={src} className="rounded-full w-full h-full object-cover" alt="" /> : null;
