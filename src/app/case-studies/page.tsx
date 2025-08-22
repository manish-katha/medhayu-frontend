
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Share2, FileText, Loader2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getCaseStudies } from '@/services/case-study.service';
import type { CaseStudy } from '@/types/case-study';
import { format } from 'date-fns';

interface CaseStudiesPageProps {
  isEmbedded?: boolean;
}

const CaseStudyCard = ({ study }: { study: CaseStudy }) => {
  const router = useRouter();
  
  const handleViewClick = () => {
    router.push(`/case-studies/${study.id}`);
  };

  const handleEditClick = () => {
    router.push(`/articles/edit/${study.id}`);
  };

  const handleShareClick = () => {
    // Placeholder for sharing logic
    console.log(`Sharing case study: ${study.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-base">{study.title}</CardTitle>
            <Badge variant={study.isPublic ? 'secondary' : 'outline'}>{study.isPublic ? 'Public' : 'Private'}</Badge>
        </div>
        <CardDescription>Patient: {study.patientDetails?.name || `Patient ID: ${study.patientId}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{study.summary}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-between items-center">
            <p className="text-xs text-muted-foreground">Date: {format(new Date(study.date), 'PPP')}</p>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleShareClick}><Share2 className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" onClick={handleViewClick}><Eye className="mr-2 h-4 w-4"/>View</Button>
                <Button variant="default" size="sm" onClick={handleEditClick}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function CaseStudiesPage({ isEmbedded = false }: CaseStudiesPageProps) {
    const router = useRouter();
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudies = async () => {
            setIsLoading(true);
            const studies = await getCaseStudies();
            setCaseStudies(studies);
            setIsLoading(false);
        };
        fetchStudies();
    }, []);

  return (
    <div className={cn(!isEmbedded && "space-y-6")}>
      {!isEmbedded && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Case Studies</h1>
            <p className="text-muted-foreground">
              Review and manage documented clinical cases.
            </p>
          </div>
          <Button onClick={() => router.push('/articles/new/case-study')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Case Study
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : caseStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.id} study={study} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
           <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
           <h3 className="mt-2 text-sm font-semibold text-gray-900">No case studies</h3>
           <p className="mt-1 text-sm text-gray-500">Get started by creating a new case study.</p>
           <div className="mt-6">
                <Button onClick={() => router.push('/articles/new/case-study')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Case Study
                </Button>
           </div>
        </div>
      )}
    </div>
  );
}
