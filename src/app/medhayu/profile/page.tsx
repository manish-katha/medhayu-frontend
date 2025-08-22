

import { getUserProfile, getBookmarksForUser } from '@/services/user.service';
import { getBooksWithStats } from '@/services/book.service';
import { getPosts } from '@/services/post.service';
import { getCirclesForUser } from '@/services/profile.service';
import { getStandaloneArticles } from '@/services/standalone-article.service';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/admin/profile/profile-client-page';

export default async function ProfilePage() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        // This case should ideally be handled by AuthProvider, but as a fallback
        notFound();
    }
    
    // Fetch all necessary data for the profile and its sub-tabs
    const [bookmarks, allBooks, posts, userCircles, discoverableUsers, allStandaloneArticles] = await Promise.all([
        getBookmarksForUser(userProfile.email),
        getBooksWithStats(),
        getPosts(),
        getCirclesForUser(userProfile.email),
        [], // Discoverable users are on a separate page now
        getStandaloneArticles(),
    ]);

    // Pass the fetched data to the client component that handles the interactive UI
    return (
         <div className="medhayu-module-container p-6">
            <ProfileClientPage 
                userProfile={userProfile}
                bookmarks={bookmarks}
                allBooks={allBooks}
                posts={posts}
                userCircles={userCircles}
                discoverableUsers={discoverableUsers}
                allStandaloneArticles={allStandaloneArticles}
                patientDetails={null}
            />
        </div>
    )
}
