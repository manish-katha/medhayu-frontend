
'use client';

import React, { useState } from 'react';
import { Event } from '@/types/event';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { EventCard } from './EventCard';

interface EventCalendarViewProps {
    events: Event[];
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const eventsOnSelectedDate = selectedDate 
        ? events.filter(event => isSameDay(new Date(event.startDate), selectedDate))
        : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="p-0"
                        components={{
                            DayContent: ({ date }) => {
                                const dayEvents = events.filter(event => isSameDay(new Date(event.startDate), date));
                                return (
                                    <div className="relative h-full w-full flex items-center justify-center">
                                        <span>{format(date, 'd')}</span>
                                        {dayEvents.length > 0 && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary"></span>}
                                    </div>
                                )
                            }
                        }}
                    />
                </Card>
            </div>
            <div className="md:col-span-2">
                 <h3 className="text-xl font-semibold mb-4">
                    Events on {selectedDate ? format(selectedDate, 'PPP') : '...'}
                </h3>
                {eventsOnSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                        {eventsOnSelectedDate.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No events scheduled for this day.</p>
                )}
            </div>
        </div>
    );
}
