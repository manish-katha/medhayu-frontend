
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppointmentCard from '@/components/Dashboard/AppointmentCard';
import { addDays, format, startOfToday } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { PatientData } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import NewAppointmentForm from '@/components/Dashboard/NewAppointmentForm';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const mockAppointments: (PatientData & {time: string, type: string, status: 'upcoming' | 'ongoing' | 'completed', date: string})[] = [
  { id: 1, name: 'Rohan Sharma', time: '10:00 AM', type: 'Initial Consultation', status: 'upcoming', date: format(startOfToday(), 'yyyy-MM-dd'), age: 45, gender: 'Male', phone: '123', condition: 'Vata Imbalance' },
  { id: 2, name: 'Priya Patel', time: '11:30 AM', type: 'Follow-up Visit', status: 'upcoming', date: format(startOfToday(), 'yyyy-MM-dd'), age: 32, gender: 'Female', phone: '123', condition: 'Pitta Disorder' },
  { id: 3, name: 'Amit Singh', time: '02:00 PM', type: 'Panchakarma Session', status: 'ongoing', date: format(startOfToday(), 'yyyy-MM-dd'), age: 50, gender: 'Male', phone: '123', condition: 'Kapha Excess' },
  { id: 4, name: 'Sneha Reddy', time: '09:00 AM', type: 'General Checkup', status: 'completed', date: format(startOfToday(), 'yyyy-MM-dd'), age: 28, gender: 'Female', phone: '123', condition: 'Digestive Problems' },
  { id: 5, name: 'Vikram Mehta', time: '04:00 PM', type: 'Initial Consultation', status: 'upcoming', date: format(startOfToday(), 'yyyy-MM-dd'), age: 61, gender: 'Male', phone: '123', condition: 'Arthritis' },
  { id: 6, name: 'Anjali Desai', time: '03:15 PM', type: 'Follow-up Visit', status: 'upcoming', date: format(addDays(startOfToday(), 1), 'yyyy-MM-dd'), age: 39, gender: 'Female', phone: '123', condition: 'Skin Conditions' },
  { id: 7, name: 'Suresh Gupta', time: '10:30 AM', type: 'General Checkup', status: 'upcoming', date: format(addDays(startOfToday(), 1), 'yyyy-MM-dd'), age: 55, gender: 'Male', phone: '123', condition: 'Respiratory Issues' },
];

const holidays = {
  '2025-07-06': 'Devshayani Ekadashi',
  '2025-07-10': 'Guru Purnima',
  '2025-07-27': 'Hariyali Teej',
  '2025-07-29': 'Nag Panchami',
};

interface AppointmentsPageProps {
  onBeginConsultation?: (patient: PatientData) => void;
  isEmbedded?: boolean;
}

export default function AppointmentsPage({ onBeginConsultation, isEmbedded = false }: AppointmentsPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredAppointments = mockAppointments.filter(
    (appointment) => selectedDate && format(new Date(appointment.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const upcomingAppointments = filteredAppointments.filter(a => a.status === 'upcoming');
  const ongoingAppointments = filteredAppointments.filter(a => a.status === 'ongoing');
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed');

  const renderDay = (day: Date) => {
    const holiday = holidays[day.toISOString().split('T')[0] as keyof typeof holidays];
    const appointmentCount = mockAppointments.filter(app => format(new Date(app.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
    
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center">
        <span>{day.getDate()}</span>
        {holiday && <Badge variant="success" className="absolute bottom-1 text-[8px] p-0.5 h-auto">{holiday}</Badge>}
        {appointmentCount > 0 && !holiday && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 items-start", isEmbedded && "grid-cols-1")}>
      <div className={cn("lg:col-span-2", isEmbedded && "col-span-1")}>
        <Card className={cn(isEmbedded && "h-full flex flex-col")}>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Appointments for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}</CardTitle>
                    <CardDescription>
                    Manage appointments for the selected date. Click on a date in the calendar to view its appointments.
                    </CardDescription>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <NewAppointmentForm onFormSubmit={() => setIsFormOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className={cn(isEmbedded && "flex-grow flex flex-col")}>
            <Tabs defaultValue="upcoming" className={cn(isEmbedded && "flex-grow flex flex-col")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing ({ongoingAppointments.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className={cn("mt-4", isEmbedded && "flex-grow")}>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((app, index) => <AppointmentCard key={index} patientData={app} onBeginConsultation={onBeginConsultation} />)
                ) : (
                  <EmptyState 
                    icon={<CalendarIcon />}
                    title="No Upcoming Appointments"
                    description="There are no upcoming appointments scheduled for this date."
                  />
                )}
              </TabsContent>
              <TabsContent value="ongoing" className={cn("mt-4", isEmbedded && "flex-grow")}>
                {ongoingAppointments.length > 0 ? (
                  ongoingAppointments.map((app, index) => <AppointmentCard key={index} patientData={app} onBeginConsultation={onBeginConsultation} />)
                ) : (
                   <EmptyState 
                    icon={<CalendarIcon />}
                    title="No Ongoing Appointments"
                    description="There are no appointments currently in progress for this date."
                  />
                )}
              </TabsContent>
              <TabsContent value="completed" className={cn("mt-4", isEmbedded && "flex-grow")}>
                {completedAppointments.length > 0 ? (
                  completedAppointments.map((app, index) => <AppointmentCard key={index} patientData={app} onBeginConsultation={onBeginConsultation} />)
                ) : (
                   <EmptyState 
                    icon={<CalendarIcon />}
                    title="No Completed Appointments"
                    description="No appointments have been completed on this date."
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {!isEmbedded && (
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                components={{
                  DayContent: ({ date }) => renderDay(date as Date)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
