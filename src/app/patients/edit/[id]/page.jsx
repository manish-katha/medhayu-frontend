'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { updatePatient, getPatient } from '@/actions/patient.action';
import { useParams, useRouter } from "next/navigation";  

export default function EditPatientPage() {
  const { toast } = useToast();
  const formRef = useRef(null);
  const router = useRouter();

  const params = useParams();
  const patientId = params.id;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    chiefComplaint: "",
    medicalHistory: "",
    cin: "",
    clinicId: "",
  });

  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ fetch patient data
  useEffect(() => {
    async function fetchPatient() {
      try {
        if (!patientId) return;
        const result = await getPatient(patientId);
        if (result.success && result.data) {
          const patient = result.data;
          setFormData({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email || "",
            address: patient.address || "",
            chiefComplaint: patient.chiefComplaint || "",
            medicalHistory: patient.medicalHistory || "",
            cin: patient.cin || "",
            clinicId: patient.clinicId || "",
          });
          setSelectedClinicId(patient.clinicId || "");
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load patient data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [patientId, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = { ...formData, clinicId: selectedClinicId };
      const result = await updatePatient(patientId, dataToSubmit);
      if (result.success) {
        toast({ title: "Updated", description: `Patient ${result.data?.name} has been updated.` });
        router.push("/patients"); // ✅ redirect after update
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Patient</h1>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-6">
        {/* --- Personal / Medical Tabs --- */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <Label>Gender</Label>
              <RadioGroup onValueChange={handleRadioChange} value={formData.gender} className="flex space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" /> <Label>Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" /> <Label>Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" /> <Label>Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Contact Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div>
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Textarea id="chiefComplaint" name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea id="medicalHistory" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.push("/patients")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Update Patient
          </Button>
        </div>
      </form>
    </div>
  );
}
