
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PatientProfileData, Visit, CaseStudy as CaseStudyType } from '@/types/patient-profile';
import { Button } from '@/components/ui/button';
import { Download, Edit, FileText, Pill, Microscope, Activity, Heart, User, Sparkles, Printer, Loader2, MoreVertical, Eye, Trash2, Share2, List, Grid, LayoutGrid } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { addCaseStudy } from '@/services/case-study.service';
import { getPrescriptionById } from '@/services/patient.service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import CaseStudyItemCard from './CaseStudyItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GenerateCaseStudyCard from './GenerateCaseStudyCard';


interface CaseStudiesTabProps {
    profileData: PatientProfileData;
}

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center text-lg font-semibold text-ayurveda-green">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
    </div>
    <div className="pl-8 text-sm text-muted-foreground space-y-3">{children}</div>
  </div>
);


const CaseStudyGenerator = ({ profileData, visit, onBack, onSave }: { profileData: PatientProfileData, visit: Visit, onBack: () => void, onSave: (cs: CaseStudyType) => void }) => {
    const { patient, invoices, labReports } = profileData;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState(false);
    const [prescription, setPrescription] = React.useState<any>(null);

    React.useEffect(() => {
        async function fetchPrescription() {
            if (visit.prescriptionId) {
                const data = await getPrescriptionById(visit.prescriptionId);
                setPrescription(data);
            }
        }
        fetchPrescription();
    }, [visit.prescriptionId]);

    const relevantReports = labReports.filter(report => {
        const visitDate = new Date(visit.date);
        const reportDate = new Date(report.date);
        return differenceInDays(visitDate, reportDate) >= 0 && differenceInDays(visitDate, reportDate) <= 30;
    });

    const handleSaveCaseStudy = async () => {
        setIsSaving(true);
        try {
            const newCaseStudyData = {
                patientId: patient.id,
                title: `Case Study: ${visit.diagnosis}`,
                condition: visit.diagnosis,
                summary: `Case study for ${patient.name} concerning ${visit.diagnosis}, created on ${format(new Date(), 'PPP')}.`,
                isPublic: false,
                version: "1.0",
                patientDetails: {
                  name: patient.name,
                  age: patient.age,
                  gender: patient.gender,
                  oid: patient.oid,
                  cin: patient.cin
                },
                clinicalPresentation: {
                  chiefComplaint: patient.chiefComplaint || "N/A",
                  associatedComplaints: patient.associatedComplaints || "N/A",
                  visitComplaint: visit.complaint
                },
                medicationProtocol: {
                  medicines: prescription?.medicines || [],
                  specialInstructions: prescription?.specialInstructions || ''
                },
                diagnosticFindings: {
                  reports: relevantReports.map(r => ({ name: r.name, date: r.date, summary: r.summary || 'Tabular data.' }))
                },
                ayurvedicAssessment: {
                  diagnosis: visit.diagnosis,
                  doshaImbalance: "Vata-Pitta" // Placeholder
                },
                treatmentPlan: {
                   diet: prescription?.dietInstructions || '',
                   lifestyle: "Recommended regular yoga." // Placeholder
                },
                outcomes: {
                   progressNotes: "Patient reported improvement in subsequent visits.", // Placeholder
                   conclusion: "The protocol was effective." // Placeholder
                }
            };
            const savedCaseStudy = await addCaseStudy(newCaseStudyData);
            onSave(savedCaseStudy);
            toast({ title: "Case Study Saved", description: `Version 1.0 has been saved successfully.` });
            onBack();
        } catch (error) {
            toast({ title: "Error Saving Case Study", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const patientDemographics = [
        patient.name,
        `${patient.age}-year-old ${patient.gender}`,
        patient.chiefComplaint ? `chief complaint of "${patient.chiefComplaint}"` : '',
    ].filter(Boolean).join(', ');


    return (
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                 <DialogTitle>Dynamic Case Study: {visit.diagnosis}</DialogTitle>
                <DialogDescription>This document is auto-generated from patient data related to the visit on {format(new Date(visit.date), 'PPP')}.</DialogDescription>
            </DialogHeader>
             <div className="flex justify-end gap-2 border-b pb-4">
                <Button variant="outline"><Printer size={16}/> Print</Button>
                <Button variant="outline"><Download size={16}/> Export PDF</Button>
                <Button onClick={handleSaveCaseStudy} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles size={16} className="mr-2"/>}
                    Save as Version 1.0
                </Button>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-6 prose prose-sm max-w-none">
                <Section title="Patient Demographics & Presentation" icon={<User size={20} />}>
                     <p>{patientDemographics}. The specific complaint for the visit on {format(new Date(visit.date), 'PPP')} was "{visit.complaint}". The diagnosis for this visit was {visit.diagnosis}.</p>
                </Section>
                <Separator className="my-6" />
                <Section title="Clinical Reports Summary" icon={<Microscope size={20} />}>
                    {relevantReports.length > 0 ? (
                        relevantReports.map(report => (
                            <div key={report.id}>
                                <h4 className="font-semibold text-foreground">{report.name} ({format(new Date(report.date), 'PPP')})</h4>
                                <p className="whitespace-pre-wrap">{report.summary || 'Tabular data available. View full report for details.'}</p>
                            </div>
                        ))
                    ) : <p>No lab reports found around the time of this visit.</p>}
                </Section>
                <Separator className="my-6" />
                <Section title="Prescription History" icon={<Pill size={20} />}>
                    {prescription ? (
                        <div>
                            <h4 className="font-semibold text-foreground">Prescription from {format(new Date(visit.date), 'PPP')}</h4>
                            <ul>
                                {prescription.medicines.map((med: any) => <li key={med.id}>{med.name} - {med.dosage} ({med.timing})</li>)}
                            </ul>
                        </div>
                    ) : <p>No specific prescription found for this visit.</p>}
                </Section>
                <Separator className="my-6" />
                <Section title="Progress Timeline & Vitals" icon={<Activity size={20} />}><p>Vitals tracking and progress notes would be visualized here.</p></Section>
                <Separator className="my-6" />
                <Section title="Ayurveda Assessment" icon={<Heart size={20} />}><p>Prakriti, Vikriti, Dosha, Dhatu, and Mala assessments would be detailed here.</p></Section>
                </div>
            </ScrollArea>
        </DialogContent>
    );
}

const CaseStudiesTab: React.FC<CaseStudiesTabProps> = ({ profileData }) => {
    const { patient, visits, caseStudies: initialCaseStudies } = profileData;
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [visitForGeneration, setVisitForGeneration] = useState<Visit | null>(null);
    const [caseStudies, setCaseStudies] = useState<CaseStudyType[]>(initialCaseStudies);
    const [view, setView] = useState<'list' | 'grid' | 'masonry'>('list');
    
    const handleGenerateClick = (visit: Visit) => {
        setVisitForGeneration(visit);
        setIsGeneratorOpen(true);
    };

    const handleSaveSuccess = (newCaseStudy: CaseStudyType) => {
        setCaseStudies(prev => [newCaseStudy, ...prev]);
        setIsGeneratorOpen(false);
        setVisitForGeneration(null);
    }
    
    const closeGenerator = () => {
        setIsGeneratorOpen(false);
        setVisitForGeneration(null);
    }

    const uniqueDiagnoses = visits.reduce((acc, visit) => {
        if (!acc.find(v => v.diagnosis === visit.diagnosis)) {
            acc.push(visit);
        }
        return acc;
    }, [] as Visit[]);

    const viewClasses = {
        list: 'space-y-2',
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        masonry: 'column-count-1 md:column-count-2 lg:column-count-3 gap-4 space-y-4'
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Case Study Management</CardTitle>
                        <CardDescription>Generate a new case study from a past clinical visit, or manage existing ones.</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                            <Grid className="h-4 w-4" />
                        </Button>
                         <Button variant={view === 'masonry' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('masonry')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="saved">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="saved">Saved Case Studies</TabsTrigger>
                        <TabsTrigger value="generate">Generate New</TabsTrigger>
                    </TabsList>
                    <TabsContent value="saved" className="mt-4">
                        {caseStudies.length > 0 ? (
                             <div className={viewClasses[view]}>
                                {caseStudies.map(cs => (
                                    <CaseStudyItemCard key={cs.id} caseStudy={cs} view={view} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<FileText />}
                                title="No Saved Case Studies"
                                description="You have not saved any case studies for this patient yet. Generate one from a past visit."
                            />
                        )}
                    </TabsContent>
                    <TabsContent value="generate" className="mt-4">
                        {uniqueDiagnoses.length > 0 ? (
                             <div className={cn(viewClasses[view])}>
                                {uniqueDiagnoses.map(visit => {
                                    const existingCaseStudy = caseStudies.find(cs => cs.condition === visit.diagnosis);
                                    return (
                                        <GenerateCaseStudyCard 
                                            key={visit.id}
                                            visit={visit}
                                            existingCaseStudy={existingCaseStudy}
                                            onGenerate={() => handleGenerateClick(visit)}
                                            view={view}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<FileText />}
                                title="No Visits Found"
                                description="A case study is generated from a patient's visit history. Once visits are recorded, you can create a case study here."
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
            
            <Dialog open={isGeneratorOpen} onOpenChange={(open) => !open && closeGenerator()}>
                {visitForGeneration && (
                    <CaseStudyGenerator 
                        profileData={profileData} 
                        visit={visitForGeneration} 
                        onBack={closeGenerator}
                        onSave={handleSaveSuccess}
                    />
                )}
            </Dialog>

        </Card>
    );
};

export default CaseStudiesTab;
