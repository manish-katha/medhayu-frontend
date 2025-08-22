

import React from 'react';
import { getCirclesForUser } from '@/services/user.service';
import CirclesTab from '@/components/admin/profile/CirclesTab';
import { notFound } from 'next/navigation';

export default async function CirclesPage() {
    // In a real app, you would get the current user's ID
    const userId = 'researcher@vakyaverse.com'; 
    
    const [userCircles] = await Promise.all([
        getCirclesForUser(userId),
    ]);

    if (!userCircles) {
        notFound();
    }

    // Pass only the circles data to the tab
    return (
        <div className="medhayu-module-container">
            <CirclesTab 
                circles={userCircles}
            />
        </div>
    );
}
