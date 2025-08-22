
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentsPage from '@/app/appointments/page';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Stethoscope, Microscope, Bot, Edit, Loader2 } from 'lucide-react';
import { PatientData } from '@/types/patient';
import PrescriptionBuilderWrapper from '@/components/prescription/PrescriptionBuilderWrapper';
import PatientForm from '@/components/Patients/PatientForm';
import { useToast } from '@/hooks/use-toast';
import AyurvedicResearchForm from '@/components/Patients/AyurvedicResearchForm';
import BotLoading from '../ui/bot-loading';
import PatientInfoCard from '../prescription/PatientInfoCard';
import PrescriptionTabs from '../prescription/PrescriptionTabs';
import { generateNextPatientId } from '@/actions/patient.actions';

type JourneyStep = 'appointments' | 'selectNewPatientMode' | 'newPatient' | 'selectResearchIntakeMethod' | 'newResearchPatient' | 'botCollectingData' | 'prescription';

interface JourneyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialStep?: JourneyStep;
  initialPatient?: PatientData | null;
}

const JourneyModal: React.FC<JourneyModalProps> = ({ 
  isOpen, 
  onOpenChange,
  initialStep = 'appointments',
  initialPatient = null
}) => {
  const [currentStep, setCurrentStep] = useState<JourneyStep>(initialStep);
  const [activePatient, setActivePatient] = useState<PatientData | null>(initialPatient);
  const [newPatientIds, setNewPatientIds] = useState<{ oid: string | null; cin: string | null }>({ oid: null, cin: null });
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        setCurrentStep(initialStep);
        setActivePatient(initialPatient);
    }
  }, [isOpen, initialStep, initialPatient]);


  const handleBeginConsultation = (patient: PatientData) => {
    setActivePatient(patient);
    setCurrentStep('prescription');
  };

  const handleAddNewPatient = async () => {
    setIsGeneratingId(true);
    try {
        const ids = await generateNextPatientId();
        setNewPatientIds(ids);
        setCurrentStep('selectNewPatientMode');
    } catch (error) {
        toast({ title: "Failed to generate patient ID", variant: "destructive", description: "Could not retrieve next patient ID from server." });
    } finally {
        setIsGeneratingId(false);
    }
  };

  const handleBackToAppointments = () => {
    setCurrentStep('appointments');
    setActivePatient(null);
    setNewPatientIds({ oid: null, cin: null });
  };

  const handlePatientSubmit = (data: any) => {
    const newPatient: PatientData = {
      id: Math.floor(1000 + Math.random() * 9000), // Mock ID, will be replaced by backend
      oid: newPatientIds.oid,
      cin: newPatientIds.cin,
      name: data.fullName,
      age: parseInt(data.age, 10),
      gender: data.gender,
      phone: data.contactNumber,
      email: data.email,
      address: data.address,
      chiefComplaint: data.chiefComplaint,
    };
    
    toast({
      title: "Patient Registered & Consultation Started",
      description: `New consultation has begun for ${newPatient.name}.`,
    });

    handleBeginConsultation(newPatient);
  };

  const deployBot = () => {
    toast({
        title: "AI Assistant Deployed",
        description: "The bot will collect detailed research data via WhatsApp. Please proceed with clinical intake.",
    });
    setCurrentStep('newPatient');
  }
  
  const resetJourney = () => {
    setCurrentStep('appointments');
    setActivePatient(null);
    setNewPatientIds({ oid: null, cin: null });
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetJourney();
    }
    onOpenChange(open);
  }

  const getTitle = () => {
    switch (currentStep) {
      case 'prescription':
        return `Consultation with : ${activePatient?.name}`;
      case 'newPatient':
        return 'Register New Patient (Clinical Intake)';
      case 'newResearchPatient':
          return 'Register New Patient (Research Intake)';
      case 'selectNewPatientMode':
          return 'Select Intake Mode';
      case 'selectResearchIntakeMethod':
          return 'Research Data Collection';
      case 'botCollectingData':
            return 'AI Assistant Deployed';
      case 'appointments':
      default:
        return 'Patient Journey';
    }
  };

  const title = getTitle();

  const showBackButton = currentStep !== 'appointments' && currentStep !== 'botCollectingData';

  const handleBackClick = () => {
    switch(currentStep) {
        case 'prescription':
        case 'selectNewPatientMode':
            handleBackToAppointments();
            break;
        case 'newPatient':
        case 'selectResearchIntakeMethod':
            setCurrentStep('selectNewPatientMode');
            break;
        case 'newResearchPatient':
            setCurrentStep('selectResearchIntakeMethod');
            break;
        default:
            break;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button variant="outline" size="icon" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {currentStep === 'appointments' && (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddNewPatient} disabled={isGeneratingId}>
                  {isGeneratingId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add New Patient
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <AppointmentsPage onBeginConsultation={handleBeginConsultation} />
            </div>
          </>
        )}
        
        {currentStep === 'selectNewPatientMode' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                 <Button variant="outline" className="w-full max-w-sm h-24 flex-col" onClick={() => setCurrentStep('newPatient')}>
                    <Stethoscope className="h-8 w-8 mb-2 text-ayurveda-green"/>
                    <span className="text-lg font-semibold">Clinical Intake</span>
                    <span className="text-xs text-muted-foreground">Standard patient registration</span>
                </Button>
                <Button variant="outline" className="w-full max-w-sm h-24 flex-col" onClick={() => setCurrentStep('selectResearchIntakeMethod')}>
                    <Microscope className="h-8 w-8 mb-2 text-ayurveda-ochre"/>
                    <span className="text-lg font-semibold">Research Intake</span>
                    <span className="text-xs text-muted-foreground">Detailed form for research cases</span>
                </Button>
            </div>
        )}

        {currentStep === 'selectResearchIntakeMethod' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                <Button variant="outline" className="w-full max-w-sm h-24 flex-col" onClick={() => setCurrentStep('newResearchPatient')}>
                    <Edit className="h-8 w-8 mb-2 text-ayurveda-green"/>
                    <span className="text-lg font-semibold">Fill Manually</span>
                    <span className="text-xs text-muted-foreground">Open the detailed research form now</span>
                </Button>
                <Button variant="outline" className="w-full max-w-sm h-24 flex-col" onClick={deployBot}>
                    <Bot className="h-8 w-8 mb-2 text-ayurveda-ochre"/>
                    <span className="text-lg font-semibold">Deploy Bot</span>
                    <span className="text-xs text-muted-foreground">Use AI to collect data via WhatsApp</span>
                </Button>
            </div>
        )}

        {currentStep === 'botCollectingData' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <BotLoading size="lg" text="Deploying Assistant..." />
                <p className="max-w-md text-muted-foreground">
                    Fine, I will collect the data and add it to the patient's record. I'll update you via notification once the process is complete.
                </p>
            </div>
        )}

        {currentStep === 'newPatient' && (
            <div className="flex-1 overflow-y-auto pr-2">
                <PatientForm 
                    onOpenChange={handleBackToAppointments} 
                    onSubmitSuccess={handlePatientSubmit}
                    oid={newPatientIds.oid}
                    cin={newPatientIds.cin}
                    showCancelButton={true}
                />
            </div>
        )}

        {currentStep === 'newResearchPatient' && (
            <div className="flex-1 overflow-y-auto pr-2">
                <AyurvedicResearchForm />
                <div className="flex justify-end p-4">
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            </div>
        )}

        {currentStep === 'prescription' && activePatient && (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <PatientInfoCard patient={activePatient} />
            <PrescriptionTabs
                selectedPatient={activePatient}
            />
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default JourneyModal;
