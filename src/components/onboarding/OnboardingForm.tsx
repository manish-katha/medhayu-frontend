
'use client';

import React, { useState, useActionState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { OnboardingFormValues } from './formSchema';
import { onboardingFormSchema, onboardingStepsConfig } from './formSchema';
import { useToast } from '@/hooks/use-toast';
import { onboardUser } from '@/actions/onboarding.actions';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper, StepperItem, StepperLabel, StepperSeparator } from '@/components/ui/stepper';
import { Loader2, ArrowLeft, ArrowRight, Save, User, GraduationCap, Stethoscope, Building, Briefcase } from 'lucide-react';

import RoleSelectionStep from './steps/RoleSelectionStep';
import AccountInfoStep from './steps/AccountInfoStep';
import StudentDetailsStep from './steps/StudentDetailsStep';
import DoctorDetailsStep from './steps/DoctorDetailsStep';
import PracticeDetailsStep from './steps/PracticeDetailsStep';

export default function OnboardingForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, formAction] = useActionState(onboardUser, { success: false });

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    mode: 'onBlur',
    defaultValues: {
      role: 'student',
      account: { name: '', email: '', phone: '', profilePictureUrl: '', password: '' },
      student: { collegeName: '', courseType: 'BAMS', yearOfStudy: '1st Year' },
      doctor: { collegeName: '', practitionerId: '', isPgStudent: false, specialization: '', pgCollegeName: '', clinics: [{ name: '', address: '' }] },
    },
  });

  const { trigger, getValues, watch } = methods;
  const role = watch('role');

  const onFormAction = (payload: FormData) => {
    const data = getValues();
    payload.set('jsonData', JSON.stringify(data));
    formAction(payload);
  };
  
  useEffect(() => {
    if (state.success) {
      toast({ title: 'Onboarding Complete!', description: 'Welcome to OPDO Medhayu. Please log in to continue.' });
      router.push('/login');
    }
    if (state.error) {
       toast({ variant: 'destructive', title: 'Onboarding Failed', description: state.error, ...(state.fieldErrors && {
           description: (
            <ul className="list-disc pl-5">
              {Object.entries(state.fieldErrors).flatMap(([field, errors]) => 
                (errors as string[]).map((error, index) => <li key={`${field}-${index}`}>{error}</li>)
              )}
            </ul>
          )
       }) });
    }
  }, [state, toast, router]);

  const steps = onboardingStepsConfig[role];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isValid = await trigger(fieldsToValidate as any, { shouldFocus: true });
    
    if (isValid) {
      if (!isLastStep) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;
    switch (stepId) {
      case 'role': return <RoleSelectionStep />;
      case 'account': return <AccountInfoStep />;
      case 'studentDetails': return <StudentDetailsStep />;
      case 'doctorDetails': return <DoctorDetailsStep isPgStudent={watch('doctor.isPgStudent')} />;
      case 'practiceDetails': return <PracticeDetailsStep />;
      default: return <div>Unknown Step</div>;
    }
  };

  return (
    <FormProvider {...methods}>
        <form action={onFormAction}>
            <Card>
                <CardHeader>
                    <Stepper className="mb-6">
                        {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center gap-1 text-center cursor-pointer" onClick={() => setCurrentStep(index)}>
                                <StepperItem isActive={currentStep === index} isCompleted={currentStep > index}>
                                    <Icon />
                                </StepperItem>
                                <StepperLabel>{step.label}</StepperLabel>
                            </div>
                            {index < steps.length - 1 && <StepperSeparator />}
                            </React.Fragment>
                        )
                        })}
                    </Stepper>
                </CardHeader>
                <CardContent>
                    {renderStepContent()}
                </CardContent>
                <CardFooter>
                    <div className="w-full flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Button>

                        {isLastStep ? (
                             <Button type="submit" disabled={state.pending}>
                                {state.pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finish
                            </Button>
                        ) : (
                            <Button type="button" onClick={nextStep}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </form>
    </FormProvider>
  );
}
