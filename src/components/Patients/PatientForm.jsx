
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Save, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPatient } from '@/actions/patient.action';
import { Label } from '../ui/label';
import { getClinicsForUser } from '@/actions/clinic.action';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SubmitButton() {
  
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="bg-ayurveda-green hover:bg-ayurveda-green/90"
      disabled={pending}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
      Register Patient
    </Button>
  );
}

const PatientForm = ({
  open,
  onOpenChange,
  onSubmitSuccess,
  oid,
  cin,
  showCancelButton = true,
}) => {
  const { toast } = useToast();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    chiefComplaint: "",
    medicalHistory: "",
    cin: cin || '',
  });

  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');

  useEffect(() => {
    async function fetchClinics() {
      const response = await getClinicsForUser();
      console.log(response)
      if (response.success && response.data) {
        setClinics(response.data);
        if (response.data.length > 0) {
          const defaultClinicId = response.data[0].id;
          setSelectedClinicId(defaultClinicId);
        }
      }
    }
    if (open) {
      fetchClinics();
       const hardcodedClinics = [
        {
          _id: "68a97084ef976213d454870a",
          userId: "68a97084ef976213d4548708",
          isShared: false,
          updatedBy: null,
          createdBy: "68a97084ef976213d4548708",
          deletedAt: null,
          deletedBy: null,
          sharedClinic: [],
          createdAt: "2025-08-23T07:40:52.506+00:00",
          updatedAt: "2025-08-23T07:40:52.506+00:00",
          __v: 0,
          practiceCenterName: "Ayush Clinic", // extra field for display
        },
      ];

      setClinics(hardcodedClinics);
      setSelectedClinicId(hardcodedClinics[0]._id);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        age: "",
        gender: "male",
        phone: "",
        email: "",
        address: "",
        chiefComplaint: "",
        medicalHistory: "",
        cin: cin || '',
      });
      formRef.current?.reset();
    }
  }, [open, cin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSubmit = { ...formData, oid, clinicId: selectedClinicId };
      const result = await createPatient(dataToSubmit);
      console.log(result);
      if (result.success && result.data) {
        toast({ title: 'Patient Created', description: `Patient ${result.data?.name} has been created.` });
        if (onSubmitSuccess) {
          onSubmitSuccess(result.data);
        }
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clinic-select">Select Clinic</Label>
        <Select value={selectedClinicId} onValueChange={(value) => setSelectedClinicId(value)} >
          <SelectTrigger id="clinic-select">
            <SelectValue placeholder="Select a clinic" />
          </SelectTrigger>
          <SelectContent>
            {clinics.map(clinic => (
              <SelectItem key={clinic._id} value={clinic._id}>
                {clinic.practiceCenterName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Patient's full name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label>Gender</Label>
            <RadioGroup
              onValueChange={handleRadioChange}
              value={formData.gender}
              className="flex space-x-4 pt-2"
              name="gender"
            >
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="male" />
                <Label className="font-normal">Male</Label>
              </div>
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="female" />
                <Label className="font-normal">Female</Label>
              </div>
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="other" />
                <Label className="font-normal">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input id="email" name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" placeholder="Patient's full address" value={formData.address} onChange={handleChange} required />
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div>
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              name="chiefComplaint"
              placeholder="Patient's main complaint or reason for visit"
              className="min-h-[100px]"
              value={formData.chiefComplaint}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              placeholder="Past medical history, surgeries, allergies, etc."
              className="min-h-[150px]"
              value={formData.medicalHistory}
              onChange={handleChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="pt-4">
        {showCancelButton && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <SubmitButton />
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-ayurveda-brown flex items-center gap-2">
            New Patient Registration
          </DialogTitle>
          <DialogDescription>
            Enter the patient details to register a new patient.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default PatientForm;
