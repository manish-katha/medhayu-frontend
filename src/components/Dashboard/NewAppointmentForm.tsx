
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PatientSearchDropdown from '@/components/Patients/PatientSearchDropdown';
import { PatientData } from '@/types/patient';
import { CalendarIcon, UserPlus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import PatientForm from '@/components/Patients/PatientForm';

const appointmentSchema = z.object({
  patient: z.any().refine(val => val, { message: "Patient is required." }),
  date: z.date({ required_error: "Date is required." }),
  time: z.string().min(1, { message: "Time is required." }),
  type: z.string().min(1, { message: "Appointment type is required." }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM"
];

interface NewAppointmentFormProps {
  onFormSubmit: () => void;
}

const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({ onFormSubmit }) => {
  const { toast } = useToast();
  const [view, setView] = useState<'appointment' | 'newPatient'>('appointment');
  const [newPatientData, setNewPatientData] = useState<PatientData | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    console.log(data);
    toast({
        title: "Appointment Created",
        description: `Appointment for ${data.patient.name} on ${format(data.date, 'PPP')} at ${data.time} has been scheduled.`,
    });
    onFormSubmit();
  };

  const handlePatientSelect = (patient: PatientData | 'new') => {
    if (patient === 'new') {
      setView('newPatient');
    } else {
      setValue('patient', patient);
       if (patient.trackProgress) {
        setValue('type', 'Follow-up Visit');
      }
    }
  };

  const handlePatientSubmitSuccess = () => {
      setView('appointment');
  }

  if (view === 'newPatient') {
    return (
      <>
        <DialogHeader>
            <div className='flex items-center gap-4'>
                 <Button variant="outline" size="icon" onClick={() => setView('appointment')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <DialogTitle>Register New Patient</DialogTitle>
                    <DialogDescription>
                        Fill in the patient's details. The form will close on successful registration.
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="py-4">
          <PatientForm 
            open={true} // The dialog is already open, so we pass true
            onOpenChange={() => setView('appointment')}
            onSubmitSuccess={handlePatientSubmitSuccess}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Appointment</DialogTitle>
        <DialogDescription>
          Fill in the details to schedule a new appointment.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div>
          <Label>Patient</Label>
          <Controller
            name="patient"
            control={control}
            render={({ field }) => (
                <PatientSearchDropdown
                    onSelectPatient={handlePatientSelect}
                    selectedPatient={field.value}
                />
            )}
          />
          {errors.patient && <p className="text-sm font-medium text-destructive">{errors.patient.message}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Date</Label>
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    )}
                />
                {errors.date && <p className="text-sm font-medium text-destructive">{errors.date.message}</p>}
            </div>

            <div>
                <Label>Time</Label>
                 <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map(slot => (
                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.time && <p className="text-sm font-medium text-destructive">{errors.time.message}</p>}
            </div>
        </div>

        <div>
            <Label>Appointment Type</Label>
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                            <SelectItem value="Follow-up Visit">Follow-up Visit</SelectItem>
                            <SelectItem value="Panchakarma Session">Panchakarma Session</SelectItem>
                            <SelectItem value="General Checkup">General Checkup</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.type && <p className="text-sm font-medium text-destructive">{errors.type.message}</p>}
        </div>

        <div>
            <Label>Notes (Optional)</Label>
            <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                    <Textarea placeholder="Any notes for this appointment..." {...field} />
                )}
            />
        </div>
        
        <DialogFooter>
          <Button type="submit">Schedule Appointment</Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default NewAppointmentForm;
