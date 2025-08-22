
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Share2, Plus, Globe, Mail, Phone, ExternalLink, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface EventDetailsClientProps {
    event: Event;
}

export function EventDetailsClient({ event }: EventDetailsClientProps) {
    const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'interested' | null>(null);
    const router = useRouter();

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const dateRange = `${format(startDate, 'E, d MMM yyyy, p')} - ${format(endDate, 'p')}`;
    const { acceptSubmissions } = event;


    return (
        <Card className="overflow-hidden">
            <div className="relative h-64 bg-muted">
                <Image src={event.posterUrl || 'https://placehold.co/1200x400.png'} alt={event.title} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                    <Badge>{event.category}</Badge>
                    <h1 className="text-4xl font-bold mt-2 text-shadow">{event.title}</h1>
                </div>
                 <div className="absolute top-4 right-4">
                    <Button variant="outline" className="bg-background/80" onClick={() => router.push(`/medhayu/events/edit/${event.id}`)}>
                        <Edit size={16} className="mr-2" />
                        Edit Event
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
                    {acceptSubmissions && (acceptSubmissions.abstracts || acceptSubmissions.whitePapers || acceptSubmissions.caseStudies) && (
                         <div>
                            <h3 className="font-semibold text-lg mb-3">Submissions</h3>
                            <div className="flex flex-wrap gap-2">
                                {acceptSubmissions.abstracts && (
                                    <Button asChild variant="outline">
                                        <Link href={`/articles/new/abstract?eventId=${event.id}`}><FileText size={16} className="mr-2"/>Submit Abstract</Link>
                                    </Button>
                                )}
                                {acceptSubmissions.whitePapers && (
                                     <Button asChild variant="outline">
                                        <Link href={`/articles/new/whitepaper?eventId=${event.id}`}><FileText size={16} className="mr-2"/>Submit White Paper</Link>
                                     </Button>
                                )}
                                {acceptSubmissions.caseStudies && (
                                    <Button asChild variant="outline">
                                        <Link href={`/articles/new/case-study?eventId=${event.id}`}><FileText size={16} className="mr-2"/>Submit Case Study</Link>
                                     </Button>
                                )}
                            </div>
                        </div>
                    )}
                    <Separator />
                    <div>
                        <h3 className="font-semibold text-lg mb-3">Organizers & Collaborators</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar><AvatarImage src={event.primaryAuthor.avatarUrl} /><AvatarFallback>{event.primaryAuthor.name.charAt(0)}</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-medium">{event.primaryAuthor.name}</p>
                                    <p className="text-xs text-muted-foreground">Primary Organizer</p>
                                </div>
                            </div>
                            {(event.collaborators || []).map(collab => (
                                <div key={collab.id} className="flex items-center gap-3">
                                    <Avatar><AvatarImage src={collab.avatarUrl} /><AvatarFallback>{collab.name.charAt(0)}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-medium">{collab.name}</p>
                                        <p className="text-xs text-muted-foreground">Collaborator</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3"><Calendar size={18} className="text-muted-foreground mt-1" /><p className="flex-1">{dateRange}</p></div>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-muted-foreground mt-1" />
                                <div>
                                    <p>{event.location.type === 'Physical' ? event.location.address : 'Virtual Event'}</p>
                                    {event.location.type === 'Virtual' && event.location.url && (
                                        <a href={event.location.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">Join Event <ExternalLink size={12}/></a>
                                    )}
                                </div>
                            </div>
                           {event.contactInfo?.email && <div className="flex items-start gap-3"><Mail size={18} className="text-muted-foreground mt-1" /><p className="flex-1">{event.contactInfo.email}</p></div>}
                           {event.contactInfo?.phone && <div className="flex items-start gap-3"><Phone size={18} className="text-muted-foreground mt-1" /><p className="flex-1">{event.contactInfo.phone}</p></div>}
                        </CardContent>
                    </Card>
                     <div className="space-y-2">
                        <Button className="w-full bg-ayurveda-green hover:bg-ayurveda-green/90">I'll Attend</Button>
                        <Button variant="outline" className="w-full">I'm Interested</Button>
                     </div>
                     <div className="flex justify-around">
                        <Button variant="ghost" size="sm" className="text-muted-foreground"><Users className="mr-2 h-4 w-4"/> {event.rsvps.length} Going</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground"><Share2 className="mr-2 h-4 w-4"/>Share</Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground"><Plus className="mr-2 h-4 w-4"/>Add to Calendar</Button>
                     </div>
                </div>
            </div>
        </Card>
    );
}
