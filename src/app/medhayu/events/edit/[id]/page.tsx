

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { EventForm } from '@/components/medhayu/events/EventForm';
import { getEventById } from '@/services/event.service';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

interface EditEventPageProps {
  params: { id: string };
}

export default async function EditEventPage({ params: paramsProp }: EditEventPageProps) {
  const params = use(paramsProp);
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/medhayu/events">Events</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit: {event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EventForm eventToEdit={event} />
    </div>
  );
}
