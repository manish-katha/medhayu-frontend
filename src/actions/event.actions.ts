
'use server';

import { z } from 'zod';
import { addEvent, updateEvent as updateEventInService, updateRsvp } from '@/services/event.service';
import { revalidatePath } from 'next/cache';
import type { Event } from '@/types/event';
import type { PostAuthor } from '@/types/user.types';

const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description is required'),
  category: z.enum(['Seminar', 'Workshop', 'Vaidya Sabha', 'Retreat', 'Online Webinar', 'Research Circle']),
  startDate: z.string(),
  endDate: z.string(),
  locationType: z.enum(['Physical', 'Virtual']),
  locationAddress: z.string().optional(),
  locationUrl: z.string().url('Must be a valid URL').optional(),
  departmentTag: z.string().optional(),
  posterUrl: z.string().url('Must be a valid URL').optional(),
  acceptAbstracts: z.string().optional(),
  acceptWhitePapers: z.string().optional(),
  acceptCaseStudies: z.string().optional(),
});

export async function createEvent(prevState: any, formData: FormData) {
  const validatedFields = eventFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    
    // In a real app, author would come from the session.
    const author: PostAuthor = { id: 'researcher@medhayu.com', name: 'Admin User', avatarUrl: '...' };

    const newEventData: Omit<Event, 'id' | 'rsvps'> = {
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        location: {
            type: data.locationType,
            address: data.locationAddress,
            url: data.locationUrl,
        },
        departmentTag: data.departmentTag,
        posterUrl: data.posterUrl,
        primaryAuthor: author,
        acceptSubmissions: {
            abstracts: data.acceptAbstracts === 'on',
            whitePapers: data.acceptWhitePapers === 'on',
            caseStudies: data.acceptCaseStudies === 'on',
        }
    };
    
    const newEvent = await addEvent(newEventData);
    revalidatePath('/medhayu/events');
    return { success: true, event: newEvent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEvent(prevState: any, formData: FormData) {
  const validatedFields = eventFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Validation failed.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  if (!validatedFields.data.id) {
    return { success: false, error: "Event ID is missing." };
  }

  try {
    const data = validatedFields.data;
    const eventId = data.id;
    
    const updatedEventData: Partial<Omit<Event, 'id' | 'rsvps'>> = {
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        location: {
            type: data.locationType,
            address: data.locationAddress,
            url: data.locationUrl,
        },
        departmentTag: data.departmentTag,
        posterUrl: data.posterUrl,
        acceptSubmissions: {
            abstracts: data.acceptAbstracts === 'on',
            whitePapers: data.acceptWhitePapers === 'on',
            caseStudies: data.acceptCaseStudies === 'on',
        }
    };
    
    const updatedEvent = await updateEventInService(eventId, updatedEventData);
    revalidatePath(`/medhayu/events/${eventId}`);
    revalidatePath('/medhayu/events');
    return { success: true, event: updatedEvent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function rsvpToEvent(eventId: string, userId: string, status: 'attending' | 'interested' | 'not-attending') {
  try {
    await updateRsvp(eventId, userId, status);
    revalidatePath(`/medhayu/events/${eventId}`);
    revalidatePath('/medhayu/events');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
