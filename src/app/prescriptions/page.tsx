
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import PrescriptionHeader from '@/components/prescription/PrescriptionHeader';
import PrescriptionTabs from '@/components/prescription/PrescriptionTabs';
import { useAppMode } from '@/components/Layout/MainLayout';
import { PatientData } from '@/types/patient';
import { useSearchParams } from 'next/navigation';
import ResearchCard from '@/components/prescription/ResearchCard';
import PatientSearchDropdown from '@/components/Patients/PatientSearchDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PatientInfoCard from '@/components/prescription/PatientInfoCard';
import { Skeleton } from '@/components/ui/skeleton';
import PatientForm from '@/components/Patients/PatientForm';
import { generateNextPatientId } from '@/actions/patient.actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function PrescriptionPageContent() {
  const { mode } = useAppMode();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const getInitialPatient = (): PatientData | null => {
    const patientName = searchParams.get('patientName');
    if (!patientName) return null;

    return {
      id: parseInt(searchParams.get('patientId') || '0'),
      name: patientName,
      age: parseInt(searchParams.get('patientAge') || '0'),
      gender: searchParams.get('patientGender') || '',
      phone: searchParams.get('patientPhone') || '', 
    };
  };

  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(getInitialPatient());
  const [searchQuery, setSearchQuery] = useState('');
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [newPatientIds, setNewPatientIds] = useState<{ oid: string | null; cin: string | null }>({ oid: null, cin: null });
  const [isGeneratingId, setIsGeneratingId] = useState(false);


  const handlePatientSelect = async (patient: PatientData | 'new') => {
    if (patient === 'new') {
        setIsGeneratingId(true);
        try {
            const ids = await generateNextPatientId();
            setNewPatientIds(ids);
            setIsPatientFormOpen(true);
        } catch (error) {
            toast({ title: "Failed to generate patient ID", variant: "destructive" });
        } finally {
            setIsGeneratingId(false);
        }
    } else {
      setSelectedPatient(patient);
    }
  };

  const handlePatientCreated = (newPatient: PatientData) => {
    setSelectedPatient(newPatient);
    setIsPatientFormOpen(false);
  }
  
  return (
    <>
      <div className="space-y-6">
        <PrescriptionHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {mode === 'clinic' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Label className="font-semibold text-base">Active Patient</Label>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-grow">
                    <PatientSearchDropdown 
                      onSelectPatient={handlePatientSelect}
                      selectedPatient={selectedPatient}
                    />
                  </div>
                  {isGeneratingId && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                {selectedPatient && (
                  <PatientInfoCard patient={selectedPatient} />
                )}
              </CardContent>
            </Card>

            {selectedPatient && (
              <PrescriptionTabs 
                selectedPatient={selectedPatient}
              />
            )}
          </div>
        ) : (
          <ResearchCard />
        )}
      </div>
      <PatientForm 
        open={isPatientFormOpen}
        onOpenChange={setIsPatientFormOpen} 
        onSubmitSuccess={handlePatientCreated}
        oid={newPatientIds.oid}
        cin={newPatientIds.cin}
      />
    </>
  );
};

const PrescriptionsPage = () => {
    return (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PrescriptionPageContent />
        </Suspense>
    );
};

export default PrescriptionsPage;
