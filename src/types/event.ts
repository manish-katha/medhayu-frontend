
'use client';

import type { PostAuthor } from './user.types';

export type EventCategory = 'Seminar' | 'Workshop' | 'Vaidya Sabha' | 'Retreat' | 'Online Webinar' | 'Research Circle';

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  location: {
    type: 'Physical' | 'Virtual';
    address?: string;
    url?: string;
  };
  contactInfo?: {
      email?: string;
      phone?: string;
  };
  departmentTag?: string; // e.g., Dravyaguna
  posterUrl?: string;
  brochureUrl?: string;
  primaryAuthor: PostAuthor;
  collaborators?: PostAuthor[];
  associatedInstitutions?: { name: string; profileUrl?: string }[];
  eventCircleId?: string; // Link to a Circle
  rsvps: { userId: string, status: 'attending' | 'interested' | 'not-attending' }[];
  acceptSubmissions?: {
    abstracts: boolean;
    whitePapers: boolean;
    caseStudies: boolean;
  };
}
