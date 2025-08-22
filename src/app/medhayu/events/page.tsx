

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, List, MapPin, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Event } from '@/types/event';
import { getEvents } from '@/services/event.service';
import { EventCard } from '@/components/medhayu/events/EventCard';
import { EventCalendarView } from '@/components/medhayu/events/EventCalendarView';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const data = await getEvents();
            setEvents(data);
            setIsLoading(false);
        };
        fetchEvents();
    }, []);

    return (
        <div className="medhayu-module-container space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Ayurveda Events</h1>
                    <p className="text-muted-foreground">Discover seminars, workshops, and sabhas in the community.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search events..." className="pl-10" />
                    </div>
                     <Button onClick={() => router.push('/medhayu/events/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                    <ToggleGroup type="single" value={view} onValueChange={(value) => { if (value) setView(value as any); }} size="sm">
                        <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="calendar" aria-label="Calendar view"><Calendar className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
            
            {view === 'calendar' && (
                <EventCalendarView events={events} />
            )}
        </div>
    );
}
