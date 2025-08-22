
'use client';

import React from 'react';
import type { UserProfile } from '@/types/user.types';
import { Briefcase, GraduationCap, Star, Link as LinkIcon, Mail, Phone, MapPin, User, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ProfileResumeViewProps {
  profile: UserProfile;
}

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="mb-6 print-break-inside-avoid">
        <h3 className="text-xl font-bold text-ayurveda-brown mb-3 flex items-center gap-3 border-b-2 border-ayurveda-ochre/30 pb-2">
            {icon} {title}
        </h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const TimelineItem = ({ title, subtitle, dateRange, children }: { title: string, subtitle?: string, dateRange: string, children?: React.ReactNode }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <h4 className="font-semibold text-lg">{title}</h4>
            <p className="text-sm text-muted-foreground">{dateRange}</p>
        </div>
        {subtitle && <p className="text-md text-ayurveda-green">{subtitle}</p>}
        {children && <div className="text-sm text-muted-foreground mt-1">{children}</div>}
    </div>
);

export const ProfileResumeView: React.FC<ProfileResumeViewProps> = ({ profile }) => {
  return (
    <div id="profile-resume-content" className="bg-white p-8 font-sans" style={{ width: '210mm', minHeight: '297mm', margin: 'auto' }}>
      <header className="flex items-center gap-8 mb-8 border-b-4 border-ayurveda-green pb-6 print-break-inside-avoid">
        <div className="relative w-36 h-36 flex-shrink-0">
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-ayurveda-brown font-headline">{profile.name}</h1>
          <h2 className="text-2xl text-ayurveda-green mt-1">{profile.experience[0]?.title || 'Ayurvedic Professional'}</h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
             {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-primary"><Mail size={14}/> {profile.email}</a>}
             <div className="flex items-center gap-2"><MapPin size={14}/> {profile.city}, {profile.state}</div>
          </div>
        </div>
      </header>
      
      <main className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
            <Section title="Professional Summary" icon={<User size={20} />}>
                <p className="text-base leading-relaxed">{profile.bio}</p>
            </Section>

            <Section title="Experience" icon={<Briefcase size={20} />}>
                {profile.experience.map((exp, index) => (
                    <TimelineItem key={index} title={exp.title} subtitle={exp.company} dateRange={`${exp.startYear} - ${exp.endYear}`} />
                ))}
            </Section>

            <Section title="Education" icon={<GraduationCap size={20} />}>
                 {profile.education.map((edu, index) => (
                    <TimelineItem key={index} title={edu.degree} subtitle={edu.institution} dateRange={`${edu.startYear} - ${edu.endYear}`}>
                        <p>Field of Study: {edu.fieldOfStudy}</p>
                    </TimelineItem>
                ))}
            </Section>
        </div>

        <div className="col-span-1 space-y-6">
            <Section title="Skills" icon={<Star size={20} />}>
                <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
                    ))}
                </div>
            </Section>

            <Section title="Online Presence" icon={<LinkIcon size={20} />}>
                <div className="space-y-2 text-base">
                    {profile.links.website && <a href={profile.links.website} className="block hover:underline truncate" target="_blank" rel="noopener noreferrer">{profile.links.website}</a>}
                    {profile.links.linkedin && <a href={profile.links.linkedin} className="block hover:underline truncate" target="_blank" rel="noopener noreferrer">{profile.links.linkedin}</a>}
                    {profile.links.github && <a href={profile.links.github} className="block hover:underline truncate" target="_blank" rel="noopener noreferrer">{profile.links.github}</a>}
                </div>
            </Section>

             <Section title="Interests" icon={<Sparkles size={20} />}>
                <ul className="list-disc list-inside space-y-1">
                    {profile.interests.map(interest => <li key={interest}>{interest}</li>)}
                </ul>
            </Section>
        </div>
      </main>
    </div>
  );
};
