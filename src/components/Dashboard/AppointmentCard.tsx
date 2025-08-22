
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { PatientData } from '@/types/patient';

interface AppointmentProps {
  patientData: PatientData & {time: string, type: string, status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled', date: string};
  className?: string;
  onBeginConsultation?: (patient: PatientData) => void;
}

const statusStyles = {
  upcoming: "bg-blue-100 text-blue-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusText = {
  upcoming: "Upcoming",
  ongoing: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

const AppointmentCard = ({ 
  patientData,
  className,
  onBeginConsultation,
}: AppointmentProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(patientData.date));
  const [selectedTime, setSelectedTime] = useState(patientData.time);

  const handleStartSession = () => {
    if (onBeginConsultation) {
      onBeginConsultation(patientData);
    } else {
      toast({
        title: "Consultation Started",
        description: `Beginning consultation with ${patientData.name}`,
      });
      
      const params = new URLSearchParams({
        patientName: patientData.name,
        patientAge: patientData.age.toString(),
        patientGender: patientData.gender,
        patientId: patientData.id.toString(),
        isNewVisit: 'true'
      });
      router.push(`/prescriptions?${params.toString()}`);
    }
  };

  const handleReschedule = () => {
    setIsRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    toast({
      title: "Appointment Rescheduled",
      description: `Appointment with ${patientData.name} has been rescheduled to ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`,
    });
    setIsRescheduleOpen(false);
  };

  return (
    <>
      <Card className={cn("mb-3", className)}>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
               <Sheet>
                <SheetTrigger asChild>
                  <div className="h-12 w-12 rounded-full bg-ayurveda-ochre/20 flex items-center justify-center text-ayurveda-ochre cursor-pointer">
                    {patientData.name.charAt(0).toUpperCase()}
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Patient Record: {patientData.name}</SheetTitle>
                    <SheetDescription>A quick summary of the patient's history.</SheetDescription>
                  </SheetHeader>
                   <div className="space-y-4 py-4">
                      <div className="bg-muted/30 rounded-md p-4">
                        <h3 className="text-sm font-medium mb-2">Patient Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          {patientData.name} is a patient with a history of {patientData.type}. Last visit was on {new Date(patientData.date).toLocaleDateString()}.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Visit History</h3>
                        <div className="space-y-3">
                           {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
                            <div key={i} className="border rounded-md p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</h4>
                                  <p className="text-xs text-muted-foreground">{patientData.type}</p>
                                </div>
                                <Badge variant="outline">{i === 0 ? "Recent" : "Previous"}</Badge>
                              </div>
                              <p className="text-sm">
                                {i === 0 
                                  ? "Patient reported improvement in symptoms after treatment."
                                  : "Initial consultation to establish treatment plan."
                                }
                              </p>
                              <div className="flex justify-end mt-2">
                                <Button variant="outline" size="sm">View Prescription</Button>
                              </div>
                            </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium text-sm">{patientData.name}</h4>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock size={14} className="mr-1" /> {patientData.time}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarCheck size={14} className="mr-1" /> {patientData.type}
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Badge className={cn(statusStyles[patientData.status], "font-normal")}>
                {statusText[patientData.status]}
              </Badge>
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleReschedule}>Reschedule</Button>
            <Button 
              size="sm" 
              variant="default" 
              className="bg-ayurveda-green hover:bg-ayurveda-green/90"
              onClick={handleStartSession}
              disabled={patientData.status === 'completed' || patientData.status === 'cancelled'}
            >
              Begin Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Appointment with {patientData.name} • {patientData.type}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select New Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select New Time</h3>
              <Select defaultValue={patientData.time} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">Regular checkup appointment</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReschedule} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCard;
