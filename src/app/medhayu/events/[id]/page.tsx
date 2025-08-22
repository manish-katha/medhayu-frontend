

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getEventById } from '@/services/event.service';
import { EventDetailsClient } from '@/components/medhayu/events/EventDetailsClient';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface EventDetailPageProps {
    params: { id: string };
}

export default async function EventDetailPage(props: EventDetailPageProps) {
    const params = use(props.params);
    const event = await getEventById(params.id);

    if (!event) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/medhayu/events">Events</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{event.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <EventDetailsClient event={event} />
        </div>
    );
}
