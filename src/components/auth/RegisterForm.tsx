
'use client';

import React, { useState } from 'react';
import { Step1 } from './steps/Step1';
import { Step2 } from './steps/Step2';
import { Step3 } from './steps/Step3';
import { Step4 } from './steps/Step4';
import { Step5 } from './steps/Step5';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUser } from '@/actions/signin.action';

export function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Step 1
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Step 2
    professionalRole: 'student', // 'student' or 'doctor'
    // Step 3
    isBams: false,
    isMdMs: false,
    ugCLgName: '',
    ugPincode: '',
    Batch: '',
    pgClgName: '',
    pgPinCode: '',
    specialization: '',
    // Step 4 (Doctor)
    isSpecialist: false,
    isPracticener: false,
    workType: '',
    futurePlan: '',
    registerationNo: '',
    // Step 5 (Clinic)
    practiceCenterType: '',
    workspaceType: '',
    practiceCenterName: '',
    practiceCenterAddress: '',
  });

  const steps = [
    { id: 'Step 1', name: 'Account Info' },
    { id: 'Step 2', name: 'Professional Details' },
    { id: 'Step 3', name: 'Education' },
    ...(formData.professionalRole === 'doctor' ? [{ id: 'Step 4', name: 'Practice Details' }] : []),
    { id: 'Step 5', name: 'Clinic Details' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive"
        });
        return;
    }
    
    const finalData = {
        ...formData,
        isStudent: formData.professionalRole === 'student',
        isDoctor: formData.professionalRole === 'doctor',
    };

    setIsLoading(true);
    const result = await createUser(finalData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: 'You can now log in.',
      });
      router.push('/login');
    } else {
      toast({
        title: 'Registration Failed',
        description: result.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step1 data={formData} handleChange={handleChange} />;
      case 1:
        return <Step2 data={formData} handleRadioChange={handleRadioChange} />;
      case 2:
        return <Step3 data={formData} handleChange={handleChange} />;
      case 3:
        if (formData.professionalRole === 'doctor') {
            return <Step4 data={formData} handleChange={handleChange} />;
        }
        // If student, this step is skipped, so show clinic details
        return <Step5 data={formData} handleChange={handleChange} isStudent={formData.professionalRole === 'student'} />;
      case 4:
         // This step is only reachable if user is a doctor
        return <Step5 data={formData} handleChange={handleChange} isStudent={false} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Stepper>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className="flex flex-col items-center gap-1 text-center cursor-pointer"
              onClick={() => setCurrentStep(index)}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep === index
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep > index
                    ? 'bg-ayurveda-green border-ayurveda-green text-white'
                    : 'bg-muted border-border'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm text-muted-foreground">{step.name}</span>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </Stepper>

      <div className="mt-8">
        {renderStepContent()}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {currentStep < steps.length - 1 && (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Submit Registration
          </Button>
        )}
      </div>
    </form>
  );
}
