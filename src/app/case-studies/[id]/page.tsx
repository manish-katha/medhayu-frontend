

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getCaseStudyById } from '@/services/case-study.service';
import { getPatient } from '@/services/patient.service';
import { CaseStudyViewer } from '@/components/CaseStudy/CaseStudyViewer';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface CaseStudyViewPageProps {
  params: { id: string };
}

export default async function CaseStudyViewPage({ params: paramsProp }: CaseStudyViewPageProps) {
  const params = use(paramsProp);
  const caseStudy = await getCaseStudyById(params.id);

  if (!caseStudy) {
    notFound();
  }

  const patient = caseStudy.patientId ? await getPatient(caseStudy.patientId) : null;
  const patientName = patient?.name || caseStudy.patientDetails?.name || 'Patient';

  return (
    <div className="bg-muted/40 min-h-screen">
        <div className="max-w-5xl mx-auto py-8 px-4">
             <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/case-studies">Case Studies</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{caseStudy.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <CaseStudyViewer caseStudy={caseStudy} patientName={patientName}/>
        </div>
    </div>
  );
}
