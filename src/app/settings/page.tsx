
'use client';

import React, { useState, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SettingsHeader from '@/components/Settings/SettingsHeader';
import ProfileTab from '@/components/Settings/ProfileTab';
import ClinicTab from '@/components/Settings/ClinicTab';
import ERPTab from '@/components/Settings/ERPTab';
import NotificationsTab from '@/components/Settings/NotificationsTab';
import SecurityTab from '@/components/Settings/SecurityTab';
import AppearanceTab from '@/components/Settings/AppearanceTab';
import AdvancedTab from '@/components/Settings/AdvancedTab';
import { User, Building, Settings as SettingsIcon, Bell, Shield, Paintbrush, SlidersHorizontal } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // A ref to hold the submit function of the active tab's form
  const activeFormSubmitter = useRef<(() => Promise<void>) | null>(null);

  const setSubmitHandler = (handler: (() => Promise<void>) | null) => {
    activeFormSubmitter.current = handler;
  };

  const handleSave = async () => {
    if (activeFormSubmitter.current) {
      setSaving(true);
      try {
        await activeFormSubmitter.current();
      } catch (error) {
        console.error("Error saving settings:", error);
        toast({
          title: "Save Failed",
          description: "An unexpected error occurred while saving.",
          variant: "destructive"
        })
      } finally {
        setSaving(false);
      }
    } else {
       toast({
        title: "No action to save",
        description: `There are no settings to save for the ${activeTab} tab.`,
        variant: "default",
      });
    }
  };
  
  const tabs = [
    { value: 'profile', label: 'Profile', icon: User, component: <ProfileTab /> },
    { value: 'clinic', label: 'Clinic', icon: Building, component: <ClinicTab setSubmitHandler={setSubmitHandler} /> },
    { value: 'erp', label: 'ERP Settings', icon: SettingsIcon, component: <ERPTab setSubmitHandler={setSubmitHandler} /> },
    { value: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationsTab /> },
    { value: 'security', label: 'Security', icon: Shield, component: <SecurityTab /> },
    { value: 'appearance', label: 'Appearance', icon: Paintbrush, component: <AppearanceTab /> },
    { value: 'advanced', label: 'Advanced', icon: SlidersHorizontal, component: <AdvancedTab /> },
  ];

  return (
    <div className="space-y-6">
      <SettingsHeader saving={saving} onSave={handleSave} />
      
      <Tabs defaultValue="profile" onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-6 items-start">
        <TabsList className="flex flex-row md:flex-col h-auto md:h-full justify-start items-stretch bg-muted/30 p-2 md:w-1/5">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="justify-start data-[state=active]:bg-ayurveda-green/10 data-[state=active]:text-ayurveda-green"
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="w-full md:w-4/5">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
