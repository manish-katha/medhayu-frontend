
'use client';

import React, { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createEvent, updateEvent } from '@/actions/event.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Event } from '@/types/event';

const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description is required'),
  category: z.enum(['Seminar', 'Workshop', 'Vaidya Sabha', 'Retreat', 'Online Webinar', 'Research Circle']),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  locationType: z.enum(['Physical', 'Virtual']),
  locationAddress: z.string().optional(),
  locationUrl: z.string().url('Must be a valid URL').optional(),
  departmentTag: z.string().optional(),
  posterUrl: z.string().url('Must be a valid URL').optional(),
  acceptAbstracts: z.boolean().default(false),
  acceptWhitePapers: z.boolean().default(false),
  acceptCaseStudies: z.boolean().default(false),
}).refine(data => {
    if (data.locationType === 'Physical') return !!data.locationAddress;
    if (data.locationType === 'Virtual') return !!data.locationUrl;
    return true;
}, {
    message: "Location address or URL is required based on location type.",
    path: ["locationAddress"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    eventToEdit?: Event;
}

export function EventForm({ eventToEdit }: EventFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!eventToEdit;
    
    const action = isEditMode ? updateEvent : createEvent;
    const [state, formAction] = useActionState(action, null);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: eventToEdit ? {
            id: eventToEdit.id,
            title: eventToEdit.title,
            description: eventToEdit.description,
            category: eventToEdit.category,
            startDate: eventToEdit.startDate.slice(0, 16),
            endDate: eventToEdit.endDate.slice(0, 16),
            locationType: eventToEdit.location.type,
            locationAddress: eventToEdit.location.address || '',
            locationUrl: eventToEdit.location.url || '',
            departmentTag: eventToEdit.departmentTag || '',
            posterUrl: eventToEdit.posterUrl || '',
            acceptAbstracts: eventToEdit.acceptSubmissions?.abstracts || false,
            acceptWhitePapers: eventToEdit.acceptSubmissions?.whitePapers || false,
            acceptCaseStudies: eventToEdit.acceptSubmissions?.caseStudies || false,
        } : {
            title: '',
            description: '',
            category: 'Seminar',
            locationType: 'Physical',
            acceptAbstracts: false,
            acceptWhitePapers: false,
            acceptCaseStudies: false,
        },
    });

    useEffect(() => {
        if (state?.success && state.event) {
            toast({ title: isEditMode ? 'Event Updated!' : 'Event Created!', description: `"${state.event.title}" has been successfully saved.` });
            if(isEditMode) {
                router.push(`/medhayu/events/${state.event.id}`);
            } else {
                router.push('/medhayu/events');
            }
        }
        if (state?.error) {
            toast({ title: 'Error', description: state.error, variant: 'destructive' });
        }
    }, [state, router, toast, isEditMode]);
    
    const handleFormSubmit = (data: EventFormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                if (value) formData.append(key, 'on');
            } else if (value) {
                formData.append(key, String(value));
            }
        });
        formAction(formData);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {isEditMode && <input type="hidden" name="id" value={eventToEdit.id} />}
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditMode ? 'Edit Event' : 'Create New Event'}</CardTitle>
                        <CardDescription>{isEditMode ? 'Update the details for your event.' : 'Provide the main details for your event.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea rows={5} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select an event category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {['Seminar', 'Workshop', 'Vaidya Sabha', 'Retreat', 'Online Webinar', 'Research Circle'].map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="departmentTag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ayurveda Department Tag (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g., Dravyaguna, Rasashastra" {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Date & Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem><FormLabel>Start Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem><FormLabel>End Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="locationType" render={({ field }) => (
                            <FormItem><FormLabel>Location Type</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Physical">Physical</SelectItem><SelectItem value="Virtual">Virtual</SelectItem></SelectContent>
                             </Select>
                            <FormMessage /></FormItem>
                        )} />
                        {form.watch('locationType') === 'Physical' && (
                             <FormField control={form.control} name="locationAddress" render={({ field }) => (
                                <FormItem><FormLabel>Venue Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                        {form.watch('locationType') === 'Virtual' && (
                             <FormField control={form.control} name="locationUrl" render={({ field }) => (
                                <FormItem><FormLabel>Event URL</FormLabel><FormControl><Input type="url" placeholder="https://zoom.us/..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="posterUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poster Image URL (Optional)</FormLabel>
                                    <FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Submissions</CardTitle>
                        <CardDescription>Configure submission options for this event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="acceptAbstracts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Accept Abstracts</FormLabel>
                                        <FormDescription>Allow users to submit abstracts for this event.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="acceptWhitePapers"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Accept White Papers</FormLabel>
                                        <FormDescription>Allow users to submit white papers.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="acceptCaseStudies"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Accept Case Studies</FormLabel>
                                        <FormDescription>Allow users to submit clinical case studies.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        {isEditMode ? 'Save Changes' : 'Create Event'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
