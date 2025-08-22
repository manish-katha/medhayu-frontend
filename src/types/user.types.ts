

import type { Post } from '@/services/post.service';

export interface PostAuthor {
    id: string;
    name: string;
    avatarUrl: string;
    role?: string;
  }
  
export interface UserProfile {
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    coverUrl: string;
    bio: string;
    education: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startYear: string;
        endYear: string;
    }[];
    experience: {
        company: string;
        title: string;
        startYear: string;
        endYear: string;
    }[];
    skills: string[];
    links: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    stats: {
        views: number;
        messages: number;
        circles: number;
    };
    // Enhanced fields for discovery
    college?: string;
    year_passed?: string;
    city: string;
    state: string;
    department: string[];
    interests: string[];
    circles: string[];
    user_type: 'Doctor' | 'Student' | 'Scholar' | 'Researcher';
    visibility: 'public' | 'private';
    career_stage: 'BAMS Student' | 'PG Scholar' | 'PhD Scholar' | 'Practitioner (1-5 yrs)' | 'Senior Consultant';
    approach?: 'Shuddha-Achara Vaidya' | 'Modern-Integrated Vaidya' | 'Tantric-Ayurveda Scholar' | 'Research & Clinical Hybrid';
}

