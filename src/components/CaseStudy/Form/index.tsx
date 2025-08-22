
'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaseStudyFormValues, caseStudyFormSchema } from './formSchema';
import { useToast } from '@/hooks/use-toast';
import { createCaseStudy } from '@/actions/case-study.actions';
import { useRouter } from 'next/navigation';
import { PatientData } from '@/types/patient';
import PatientSearchDropdown from '@/components/Patients/PatientSearchDropdown';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Save, User, Pill, Microscope, BookOpen, Plus, Trash2, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CaseStudyPreview from './CaseStudyPreview';

interface CaseStudyFormProps {
    initialData?: CaseStudyFormValues;
    patient?: PatientData | null;
}

const CaseStudyForm: React.FC<CaseStudyFormProps> = ({ initialData, patient: initialPatient }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(createCaseStudy, { success: false });
    const [selectedPatient, setSelectedPatient] = React.useState<PatientData | null>(initialPatient || null);
    const [jsonData, setJsonData] = useState('');

    const form = useForm<CaseStudyFormValues>({
        resolver: zodResolver(caseStudyFormSchema),
        defaultValues: initialData || {
            patientDetails: {
                id: initialPatient?.id,
                name: initialPatient?.name,
                age: initialPatient?.age,
                gender: initialPatient?.gender,
            },
            title: '',
            condition: '',
            summary: '',
            clinicalPresentation: {
                chiefComplaint: '',
                associatedComplaints: '',
                visitComplaint: ''
            },
            medicationProtocol: {
                medicines: [],
                specialInstructions: ''
            },
            diagnosticFindings: {
                reports: [],
            },
            ayurvedicAssessment: {
                diagnosis: '',
                doshaImbalance: ''
            },
            treatmentPlan: {
                diet: '',
                lifestyle: ''
            },
            outcomes: {
                progressNotes: '',
                conclusion: ''
            },
            isPublic: false,
        },
    });
    
    const { control, handleSubmit, setValue, getValues, formState } = form;

    const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({
        control,
        name: "medicationProtocol.medicines",
    });
    
    const { fields: reportFields, append: appendReport, remove: removeReport } = useFieldArray({
        control,
        name: "diagnosticFindings.reports",
    });

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Case Study Saved", description: "Your case study has been saved successfully." });
            router.push('/case-studies');
        }
        if (state?.error) {
            toast({ title: "Error", description: state.error, variant: 'destructive' });
        }
    }, [state, toast, router]);

    const handlePatientSelect = (patient: PatientData | 'new') => {
        if (patient !== 'new') {
            setSelectedPatient(patient);
            setValue('patientDetails', { id: patient.id, name: patient.name, age: patient.age, gender: patient.gender, oid: patient.oid, cin: patient.cin });
            setValue('patientId', patient.id);
        }
    };
    
    const onFormSubmit = (data: CaseStudyFormValues) => {
        setJsonData(JSON.stringify(data));
        // The form's `action` will handle the submission
    };

    return (
        <Form {...form}>
            <form 
                onSubmit={handleSubmit(onFormSubmit)}
                action={formAction}
            >
                {/* Hidden input to pass stringified JSON data */}
                <input type="hidden" name="jsonData" value={jsonData} />

                <Card>
                    <CardHeader>
                        <CardTitle>{initialData ? 'Edit Case Study' : 'New Case Study'}</CardTitle>
                        <CardDescription>
                            Document a clinical case for future reference, research, or sharing on Medhayu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2"><User size={18}/> General & Presentation</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                     <FormField
                                        control={control}
                                        name="patientDetails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Patient</FormLabel>
                                                <FormControl>
                                                    <PatientSearchDropdown
                                                        onSelectPatient={handlePatientSelect}
                                                        selectedPatient={selectedPatient}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField control={control} name="title" render={({ field }) => (<FormItem><FormLabel>Case Study Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={control} name="condition" render={({ field }) => (<FormItem><FormLabel>Condition</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={control} name="summary" render={({ field }) => (<FormItem><FormLabel>Brief Summary</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                    <Separator />
                                    <FormField control={control} name="clinicalPresentation.chiefComplaint" render={({ field }) => (<FormItem><FormLabel>Chief Complaint</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                    <FormField control={control} name="clinicalPresentation.associatedComplaints" render={({ field }) => (<FormItem><FormLabel>Associated Complaints</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2"><Pill size={18}/> Medication & Diet</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <h4 className="font-medium">Medication Protocol</h4>
                                    {medicineFields.map((field, index) => (
                                         <div key={field.id} className="flex items-end gap-2">
                                            <FormField control={control} name={`medicationProtocol.medicines.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel>Medicine</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={control} name={`medicationProtocol.medicines.${index}.dosage`} render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={control} name={`medicationProtocol.medicines.${index}.timing`} render={({ field }) => (<FormItem><FormLabel>Timing</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeMedicine(index)}><Trash2 size={16}/></Button>
                                         </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendMedicine({ name: '', dosage: '', timing: '' })}><Plus size={16} className="mr-2" />Add Medicine</Button>
                                    <Separator />
                                     <FormField control={control} name="treatmentPlan.diet" render={({ field }) => (<FormItem><FormLabel>Dietary Advice</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                     <FormField control={control} name="treatmentPlan.lifestyle" render={({ field }) => (<FormItem><FormLabel>Lifestyle Recommendations</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>
                                     <div className="flex items-center gap-2"><Microscope size={18}/> Diagnostics & Assessment</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                     <h4 className="font-medium">Diagnostic Findings</h4>
                                     {reportFields.map((field, index) => (
                                         <div key={field.id} className="space-y-2 border p-2 rounded-md">
                                             <div className="flex justify-end"><Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeReport(index)}><Trash2 size={12}/></Button></div>
                                             <FormField control={control} name={`diagnosticFindings.reports.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Report Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                             <FormField control={control} name={`diagnosticFindings.reports.${index}.summary`} render={({ field }) => (<FormItem><FormLabel>Report Summary</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                         </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendReport({ name: '', summary: '', date: new Date().toISOString() })}><Plus size={16} className="mr-2" />Add Report</Button>
                                    <Separator/>
                                     <FormField control={control} name="ayurvedicAssessment.diagnosis" render={({ field }) => (<FormItem><FormLabel>Ayurvedic Diagnosis</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                     <FormField control={control} name="ayurvedicAssessment.doshaImbalance" render={({ field }) => (<FormItem><FormLabel>Dosha Imbalance</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger>
                                     <div className="flex items-center gap-2"><BookOpen size={18}/> Outcomes & Conclusion</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                     <FormField control={control} name="outcomes.progressNotes" render={({ field }) => (<FormItem><FormLabel>Progress Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                     <FormField control={control} name="outcomes.conclusion" render={({ field }) => (<FormItem><FormLabel>Conclusion</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        
                        <Separator className="my-6" />

                        <FormField
                            control={control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Share Publicly on Medhayu</FormLabel>
                                    <FormDescription>
                                    If enabled, this case study will be anonymized and shared with the Medhayu community.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline"><Eye size={16} className="mr-2"/>Preview</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[90vh]">
                                <CaseStudyPreview caseStudyData={getValues()} />
                            </DialogContent>
                        </Dialog>
                        <Button type="submit" disabled={formState.isSubmitting}>
                             {formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Case Study
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};

export default CaseStudyForm;

    
