
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const ProfileTab = () => {
  // In a real application, you would fetch user data and use a form library
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <User size={18} />
            User Profile
        </CardTitle>
        <CardDescription>
          Update your personal details and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/media/_cce41b04-07a0-4c49-bd66-7d2b4a59f1a7.jpg" alt="Admin User" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <Button variant="outline">Change Photo</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="Admin User" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="admin@oshadham.com" disabled />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            placeholder="Tell us a little about yourself"
            defaultValue="Lead Ayurvedic Physician at Oshadham Ayurveda, specializing in Panchakarma and chronic disease management."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
