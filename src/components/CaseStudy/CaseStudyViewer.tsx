

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { CaseStudy } from '@/types/case-study';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { User, Pill, Microscope, BookOpen, Download, Printer, Edit, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/services/post.service';
import { ShareWorkDialog } from '@/components/medhayu/wall/ShareWorkDialog';
import { getCirclesForUser } from '@/services/user.service';
import type { Circle } from '@/types';

interface CaseStudyViewerProps {
  caseStudy: CaseStudy;
  patientName: string;
}

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="flex items-center text-xl font-semibold text-ayurveda-green mb-4">
        {icon}
        <span className="ml-3">{title}</span>
    </h3>
    <div className="pl-12 text-muted-foreground prose prose-sm max-w-none prose-ul:list-disc prose-ul:pl-5">
      {children}
    </div>
  </div>
);

export const CaseStudyViewer: React.FC<CaseStudyViewerProps> = ({ caseStudy, patientName }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userCircles, setUserCircles] = useState<Circle[]>([]);
  const caseStudyContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, you'd get the current user's ID
    getCirclesForUser('researcher@vakyaverse.com').then(setUserCircles);
  }, []);


  const handleEdit = () => {
    router.push(`/articles/edit/${caseStudy.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const onPostCreated = () => {
     toast({
        title: "Case Study Shared",
        description: `"${caseStudy.title}" has been posted to the wall.`,
      });
  }
  
  const patientIdentifier = caseStudy.isPublic 
    ? `a patient (CIN: ${caseStudy.patientDetails?.cin || 'N/A'}, OID: ${caseStudy.patientDetails?.oid || 'N/A'})`
    : `**${patientName}**`;
  
  return (
    <>
    <div>
        <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">{caseStudy.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                            A clinical case study regarding <span className="font-semibold">{caseStudy.condition}</span>.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
                        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download</Button>
                        <Button onClick={() => setIsShareOpen(true)}><Share2 className="h-4 w-4 mr-2" /> Share to Medhayu</Button>
                        <Button onClick={handleEdit}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8" id="case-study-viewer-content" ref={caseStudyContentRef}>
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-lg font-semibold text-ayurveda-brown">Case Summary</h2>
                    <p className="mt-2 text-muted-foreground italic">{caseStudy.summary}</p>
                </div>

                <Section title="Patient Presentation" icon={<User size={24} />}>
                <p>
                    The case involves {patientIdentifier}, a {caseStudy.patientDetails?.age}-year-old {caseStudy.patientDetails?.gender}.
                </p>
                <p><strong>Chief Complaint:</strong> {caseStudy.clinicalPresentation?.chiefComplaint}</p>
                {caseStudy.clinicalPresentation?.associatedComplaints && <p><strong>Associated Complaints:</strong> {caseStudy.clinicalPresentation.associatedComplaints}</p>}
                </Section>
                <Separator className="my-6"/>

                <Section title="Medication & Diet" icon={<Pill size={24} />}>
                <h4 className="font-semibold text-foreground">Medication Protocol</h4>
                <ul>
                    {caseStudy.medicationProtocol?.medicines?.map((med, i) => (
                    <li key={i}>{med.name} - {med.dosage} ({med.timing})</li>
                    ))}
                </ul>
                {caseStudy.medicationProtocol?.specialInstructions && <p><strong>Special Instructions:</strong> {caseStudy.medicationProtocol.specialInstructions}</p>}
                <h4 className="font-semibold text-foreground mt-4">Dietary & Lifestyle Advice</h4>
                {caseStudy.treatmentPlan?.diet && <p><strong>Diet:</strong> {caseStudy.treatmentPlan.diet}</p>}
                {caseStudy.treatmentPlan?.lifestyle && <p><strong>Lifestyle:</strong> {caseStudy.treatmentPlan.lifestyle}</p>}
                </Section>
                <Separator className="my-6"/>

                <Section title="Diagnostics & Assessment" icon={<Microscope size={24} />}>
                <h4 className="font-semibold text-foreground">Diagnostic Findings</h4>
                {caseStudy.diagnosticFindings?.reports?.map((report, i) => (
                    <div key={i} className="mt-2">
                        <p><strong>{report.name} ({report.date ? format(new Date(report.date), 'PPP') : 'N/A'}):</strong></p>
                        <p className="whitespace-pre-wrap">{report.summary}</p>
                    </div>
                    ))}
                <h4 className="font-semibold text-foreground mt-4">Ayurvedic Assessment</h4>
                {caseStudy.ayurvedicAssessment?.diagnosis && <p><strong>Diagnosis:</strong> {caseStudy.ayurvedicAssessment.diagnosis}</p>}
                {caseStudy.ayurvedicAssessment?.doshaImbalance && <p><strong>Dosha Imbalance:</strong> {caseStudy.ayurvedicAssessment.doshaImbalance}</p>}
                </Section>
                <Separator className="my-6"/>
                
                <Section title="Outcomes" icon={<BookOpen size={24} />}>
                {caseStudy.outcomes?.progressNotes && <p><strong>Progress Notes:</strong> {caseStudy.outcomes.progressNotes}</p>}
                {caseStudy.outcomes?.conclusion && <p><strong>Conclusion:</strong> {caseStudy.outcomes.conclusion}</p>}
                </Section>
            </CardContent>
        </Card>
    </div>
    <ShareWorkDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        onPostCreated={onPostCreated}
        userCircles={userCircles}
        preselectedWork={caseStudy}
        workHtmlContent={caseStudyContentRef.current?.innerHTML}
    />
    </>
  );
};
