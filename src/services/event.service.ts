
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Event } from '@/types/event';
import path from 'path';

const eventsFilePath = path.join(corpusPath, 'events.json');

export async function getEvents(): Promise<Event[]> {
    const events = await readJsonFile<Event[]>(eventsFilePath, []);
    // Sort by start date, newest first
    return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export async function getEventById(id: string): Promise<Event | undefined> {
    const events = await getEvents();
    return events.find(e => e.id === id);
}

export async function addEvent(eventData: Omit<Event, 'id' | 'rsvps'>): Promise<Event> {
    const events = await getEvents();
    const newEvent: Event = {
        id: `evt-${Date.now()}`,
        rsvps: [],
        ...eventData,
    };
    
    if (!newEvent.acceptSubmissions) {
        newEvent.acceptSubmissions = {
            abstracts: false,
            whitePapers: false,
            caseStudies: false,
        };
    }

    events.unshift(newEvent);
    await writeJsonFile(eventsFilePath, events);
    return newEvent;
}

export async function updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<Event> {
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
        throw new Error('Event not found');
    }

    const updatedEvent = { ...events[eventIndex], ...updates };
    events[eventIndex] = updatedEvent;
    
    await writeJsonFile(eventsFilePath, events);
    return updatedEvent;
}


export async function updateRsvp(eventId: string, userId: string, status: 'attending' | 'interested' | 'not-attending'): Promise<Event> {
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        throw new Error('Event not found');
    }
    const event = events[eventIndex];
    
    // Remove existing RSVP for the user, if any
    event.rsvps = event.rsvps.filter(rsvp => rsvp.userId !== userId);
    
    // Add new RSVP
    event.rsvps.push({ userId, status });

    events[eventIndex] = event;
    await writeJsonFile(eventsFilePath, events);
    return event;
}
