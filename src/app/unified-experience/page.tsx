
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JourneyModal from '@/components/Journey/JourneyModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppointmentsPage from '@/app/appointments/page';
import CaseStudiesPage from '@/app/case-studies/page';
import BillingPage from '@/app/erp/billing/page';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AnimatedCardButton from '@/components/ui/AnimatedCardButton';
import { Sparkles } from 'lucide-react';

// A simple placeholder for the TaskList component
const TaskList = () => (
    <div className="space-y-4">
        <h3 className="font-semibold">Today's Tasks</h3>
        <div className="flex items-center space-x-2">
            <Checkbox id="task1" />
            <Label htmlFor="task1">Follow up with Rajesh Kumar</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="task2" />
            <Label htmlFor="task2">Review lab reports for Sunita Sharma</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="task3" checked />
            <Label htmlFor="task3" className="line-through text-muted-foreground">Prepare diet chart for Amit Verma</Label>
        </div>
    </div>
);


type ViewMode = 'appointments' | 'tasks' | 'invoices' | 'casestudies';

export default function UnifiedExperiencePage() {
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('appointments');

  useEffect(() => {
    const savedView = localStorage.getItem('unifiedExperienceView') as ViewMode;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    localStorage.setItem('unifiedExperienceView', newView);
  };

  const renderContent = () => {
    switch(viewMode) {
      case 'appointments':
        return <AppointmentsPage isEmbedded={true} />;
      case 'tasks':
        return <TaskList />;
      case 'invoices':
        return <BillingPage isEmbedded={true} />;
      case 'casestudies':
        return <CaseStudiesPage isEmbedded={true} />;
      default:
        return <AppointmentsPage isEmbedded={true} />;
    }
  }

  const viewTitles: Record<ViewMode, string> = {
    appointments: 'Appointments',
    tasks: 'Task List',
    invoices: 'Recent Invoices',
    casestudies: 'Case Studies'
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-8 h-full">
        <div className="col-span-8 h-full">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{viewTitles[viewMode]}</CardTitle>
                            <CardDescription>Your primary workspace view. Change it anytime.</CardDescription>
                        </div>
                        <Select value={viewMode} onValueChange={(value: ViewMode) => handleViewChange(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a view" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appointments">Appointments</SelectItem>
                                <SelectItem value="tasks">Tasks</SelectItem>
                                <SelectItem value="invoices">Invoices</SelectItem>
                                <SelectItem value="casestudies">Case Studies</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {renderContent()}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <div className="col-span-4">
          <div className="sticky top-6">
            <AnimatedCardButton onClick={() => setIsJourneyModalOpen(true)} className="p-4">
                <h2 className="text-xl md:text-2xl font-bold text-white text-shadow">
                    Embark on your journey as a healer.
                </h2>
                <p className="mt-2 text-base text-white/90 text-shadow-sm max-w-lg mx-auto">
                    Begin patient care and transform lives through authentic Ayurvedic treatment.
                </p>
                <div className="mt-6">
                    <Button
                        className="
                        px-8 py-4 text-base font-semibold text-white bg-transparent
                        border-2 border-white/20 rounded-lg shadow-lg
                        transition-all duration-500
                        hover:bg-black/50 hover:border-transparent hover:shadow-2xl hover:-translate-y-1
                        "
                    >
                        Start Healing
                    </Button>
                </div>
            </AnimatedCardButton>
          </div>
        </div>
      </div>
      <JourneyModal isOpen={isJourneyModalOpen} onOpenChange={setIsJourneyModalOpen} />
    </>
  );
}
