
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeBannerProps {
  doctorName?: string;
}

const WelcomeBanner = ({ doctorName = "Dr. Ayurveda" }: WelcomeBannerProps) => {
  const router = useRouter();
  
  return (
    <div className="border-none bg-gradient-to-r from-ayurveda-green/10 to-ayurveda-ochre/10 rounded-lg overflow-hidden mb-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ayurveda-green mb-1">
              Welcome back, {doctorName}!
            </h2>
            <p className="text-muted-foreground mb-4 md:mb-0">
              Your clinic dashboard is ready. You have 8 appointments today and 3 prescriptions to review.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>View Tutorial</span>
            </Button>
            <Button 
              className="bg-ayurveda-green hover:bg-ayurveda-green/90 flex items-center gap-2"
              onClick={() => router.push('/settings')}
            >
              <Settings size={16} />
              <span>Configure Clinic</span>
            </Button>
          </div>
        </div>
    </div>
  );
};

export default WelcomeBanner;
