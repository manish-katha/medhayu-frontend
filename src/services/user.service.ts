
'use server';

import type { Bookmark, Circle } from '@/types/book';
import { readJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';
import type { UserProfile } from '@/types/user.types';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/user.model';


const bookmarksFilePath = path.join(corpusPath, 'bookmarks.json');
const circlesFilePath = path.join(corpusPath, 'circles.json');
const discoverableUsersFilePath = path.join(corpusPath, 'users.json');


export async function getUserProfile(email: string = 'default'): Promise<UserProfile | null> {
    await connectToDatabase();
    
    // In a real app with proper auth, we'd get the email from the session.
    // The default is a fallback for initial development.
    const userEmail = email === 'default' ? 'researcher@medhayu.com' : email;
    
    const user = await User.findOne({ email: userEmail });

    if (!user) {
        return null;
    }
    
    // This maps the MongoDB document to the UserProfile type.
    // It's a placeholder for a more complete profile that might aggregate data.
    const userProfile: UserProfile = {
        name: user.name,
        username: user.email.split('@')[0], // Simple username generation
        email: user.email,
        avatarUrl: '/media/pexels-life-of-pix-7974.jpg', // Placeholder
        coverUrl: '/media/wp10610074-mountain-at-night-wallpapers.jpg', // Placeholder
        bio: user.futurePlan || 'A passionate Ayurvedic practitioner.',
        education: [
            {
              institution: user.ugCLgName || 'Ayurveda University',
              degree: user.isMdMs ? 'MD/MS' : 'BAMS',
              fieldOfStudy: user.specialization || 'Ayurvedic Medicine',
              startYear: user.Batch || 'N/A',
              endYear: 'N/A',
            }
        ],
        experience: [
            {
              company: user.practiceCenterName || "Self-Employed",
              title: user.isSpecialist ? "Specialist" : "Practitioner",
              startYear: '2020', // Placeholder
              endYear: "Present"
            }
        ],
        skills: user.specialization ? [user.specialization] : ["Kayachikitsa", "Panchakarma"],
        links: {},
        stats: { views: 0, messages: 0, circles: 0 },
        college: user.ugCLgName,
        year_passed: user.Batch,
        city: 'Unknown',
        state: 'Unknown',
        department: user.specialization ? [user.specialization] : [],
        interests: [],
        circles: [],
        user_type: user.isDoctor ? 'Doctor' : 'Student',
        visibility: 'public',
        career_stage: 'Practitioner (1-5 yrs)',
        approach: 'Modern-Integrated Vaidya',
    };
    
    return userProfile;
}

export async function getBookmarksForUser(userId: string): Promise<Bookmark[]> {
    const bookmarks = await readJsonFile<Bookmark[]>(bookmarksFilePath, []);
    return bookmarks.filter(bm => bm.userId === userId);
}

export async function getDiscoverableUsers(): Promise<UserProfile[]> {
    const users = await readJsonFile<UserProfile[]>(discoverableUsersFilePath, []);
    return users.filter(u => u.email !== 'researcher@medhayu.com');
}

export async function getCirclesForUser(userId: string): Promise<Circle[]> {
    const circles = await readJsonFile<Circle[]>(circlesFilePath, []);
    return circles.filter(c => c.members.some(m => m.userId === userId));
}
