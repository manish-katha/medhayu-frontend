
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import AyurvedicResearchForm from '@/components/Patients/AyurvedicResearchForm';

const ResearchCard: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="bg-ayurveda-green/5 border-b pb-3">
        <CardTitle className="text-ayurveda-green flex items-center">
          <FileText size={18} className="mr-2" /> Research Mode - Detailed Patient Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <AyurvedicResearchForm />
      </CardContent>
    </Card>
  );
};

export default ResearchCard;
