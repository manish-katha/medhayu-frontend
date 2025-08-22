
import { getUserProfile, getBookmarksForUser } from '@/services/user.service';
import { getBooksWithStats } from '@/services/book.service';
import { getPosts } from '@/services/post.service';
import { getCirclesForUser } from '@/services/profile.service';
import { getStandaloneArticles } from '@/services/standalone-article.service';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/admin/profile/profile-client-page';
import { use } from 'react';

interface ProfilePageProps {
  params: { username: string };
}

export default async function ProfilePage({ params: paramsProp }: ProfilePageProps) {
    const params = use(paramsProp);
    // In a real app, you would fetch user data by username or a unique ID.
    // We'll simulate this by finding the user in our mock data.
    const userProfile = await getUserProfile(params.username);
    
    if (!userProfile) {
        notFound();
    }
    
    const [bookmarks, allBooks, posts, userCircles, discoverableUsers, allStandaloneArticles] = await Promise.all([
        getBookmarksForUser(userProfile.email),
        getBooksWithStats(), // This would also be filtered by user in a real app
        getPosts(userProfile.email),
        getCirclesForUser(userProfile.email),
        [],
        getStandaloneArticles(), // This would also be filtered
    ]);

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
