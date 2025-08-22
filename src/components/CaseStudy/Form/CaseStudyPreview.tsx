
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { User, Pill, Microscope, BookOpen } from 'lucide-react';
import type { CaseStudyFormValues } from './formSchema';
import { format } from 'date-fns';

interface CaseStudyPreviewProps {
  caseStudyData: CaseStudyFormValues;
}

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center text-lg font-semibold text-ayurveda-green">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
    </div>
    <div className="pl-8 text-sm text-muted-foreground space-y-3 prose prose-sm max-w-none">{children}</div>
  </div>
);

const CaseStudyPreview: React.FC<CaseStudyPreviewProps> = ({ caseStudyData }) => {
  const {
    patientDetails,
    title,
    summary,
    condition,
    isPublic,
    clinicalPresentation,
    medicationProtocol,
    diagnosticFindings,
    ayurvedicAssessment,
    treatmentPlan,
    outcomes,
  } = caseStudyData;

  const patientIdentifier = isPublic
    ? `Patient (CIN: ${patientDetails?.cin || 'N/A'}, OID: ${patientDetails?.oid || 'N/A'})`
    : patientDetails?.name || 'Patient';

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          A preview of the case study for {condition}.
        </DialogDescription>
      </DialogHeader>
      <div className="flex-grow overflow-y-auto pr-4">
        <p className="mb-4 italic text-muted-foreground">{summary}</p>

        <Section title="Patient Presentation" icon={<User size={20} />}>
          <p>
            The case involves {patientIdentifier}, a {patientDetails?.age}-year-old {patientDetails?.gender}.
          </p>
          <p><strong>Chief Complaint:</strong> {clinicalPresentation?.chiefComplaint}</p>
          {clinicalPresentation?.associatedComplaints && <p><strong>Associated Complaints:</strong> {clinicalPresentation.associatedComplaints}</p>}
        </Section>
        <Separator className="my-4"/>

        <Section title="Medication & Diet" icon={<Pill size={20} />}>
          <h4>Medication Protocol</h4>
          <ul>
            {medicationProtocol?.medicines?.map((med, i) => (
              <li key={i}>{med.name} - {med.dosage} ({med.timing})</li>
            ))}
          </ul>
          {medicationProtocol?.specialInstructions && <p><strong>Special Instructions:</strong> {medicationProtocol.specialInstructions}</p>}
          <h4>Dietary & Lifestyle Advice</h4>
          {treatmentPlan?.diet && <p><strong>Diet:</strong> {treatmentPlan.diet}</p>}
          {treatmentPlan?.lifestyle && <p><strong>Lifestyle:</strong> {treatmentPlan.lifestyle}</p>}
        </Section>
        <Separator className="my-4"/>

        <Section title="Diagnostics & Assessment" icon={<Microscope size={20} />}>
          <h4>Diagnostic Findings</h4>
           {diagnosticFindings?.reports?.map((report, i) => (
              <div key={i} className="mt-2">
                <p><strong>{report.name} ({report.date ? format(new Date(report.date), 'PPP') : 'N/A'}):</strong></p>
                <p>{report.summary}</p>
              </div>
            ))}
          <h4>Ayurvedic Assessment</h4>
          {ayurvedicAssessment?.diagnosis && <p><strong>Diagnosis:</strong> {ayurvedicAssessment.diagnosis}</p>}
          {ayurvedicAssessment?.doshaImbalance && <p><strong>Dosha Imbalance:</strong> {ayurvedicAssessment.doshaImbalance}</p>}
        </Section>
        <Separator className="my-4"/>
        
        <Section title="Outcomes" icon={<BookOpen size={20} />}>
          {outcomes?.progressNotes && <p><strong>Progress Notes:</strong> {outcomes.progressNotes}</p>}
          {outcomes?.conclusion && <p><strong>Conclusion:</strong> {outcomes.conclusion}</p>}
        </Section>
      </div>
    </>
  );
};

export default CaseStudyPreview;
