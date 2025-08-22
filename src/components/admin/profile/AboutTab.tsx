
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { User, Book, Briefcase, GraduationCap, Link as LinkIcon, Edit } from 'lucide-react';
import type { UserProfile } from '@/types/user.types';
import { Button } from '@/components/ui/button';

interface AboutTabProps {
  userProfile: UserProfile;
}

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center text-lg font-semibold text-ayurveda-green">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={14}/></Button>
    </div>
    <div className="pl-8 text-sm text-muted-foreground space-y-3">{children}</div>
  </div>
);

const AboutTab: React.FC<AboutTabProps> = ({ userProfile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <Section title="About" icon={<User size={20} />}>
              <p>{userProfile.bio}</p>
            </Section>
            
            <Section title="Education" icon={<GraduationCap size={20} />}>
              {userProfile.education.map((edu, index) => (
                <div key={index}>
                  <p className="font-semibold text-foreground">{edu.institution}</p>
                  <p>{edu.degree}, {edu.fieldOfStudy}</p>
                  <p className="text-xs">{edu.startYear} - {edu.endYear}</p>
                </div>
              ))}
            </Section>
            
             <Section title="Experience" icon={<Briefcase size={20} />}>
              {userProfile.experience.map((exp, index) => (
                <div key={index}>
                  <p className="font-semibold text-foreground">{exp.title} at {exp.company}</p>
                  <p className="text-xs">{exp.startYear} - {exp.endYear}</p>
                </div>
              ))}
            </Section>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
         <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills & Endorsements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {userProfile.skills.map((skill: string) => (
              <div key={skill} className="text-sm bg-muted px-3 py-1 rounded-full">{skill}</div>
            ))}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="text-base">Shastra Interests</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <div className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Charaka Samhita</div>
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Sushruta Samhita</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutTab;
