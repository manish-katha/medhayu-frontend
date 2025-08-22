
'use client';

import React from 'react';
import ReportPreview from '@/components/Patients/Profile/ReportPreview';
import { ExtractedLabData } from '@/ai/flows/extract-lab-report-data';
import { EmptyState } from '@/components/ui/empty-state';
import { FileWarning } from 'lucide-react';
import { LabReport } from '@/types/patient-profile';

interface ReportViewProps {
  report: LabReport;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const reportData: ExtractedLabData = {
    reportType: report.name,
    testResults: report.results || [],
    summary: report.summary || '',
  };

  const hasParsedData = (reportData.testResults.length > 0) || (reportData.summary && reportData.summary.trim() !== '');

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-2 md:p-8">
      <div className="w-full h-full flex flex-col">
        <div 
          className="bg-white shadow-lg mx-auto flex flex-col w-[210mm] min-h-[297mm] p-12"
        >
          {hasParsedData ? (
            <ReportPreview data={reportData} reportDate={report.date} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<FileWarning />}
                title="No Parsed Data"
                description="The structured data for this report has not been saved. You can try re-uploading the original PDF to parse it."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportView;
