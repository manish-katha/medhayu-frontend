
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCopy, FilePlus2, Badge, Edit, Globe, Lock } from 'lucide-react';
import { SOPTemplate } from './PrescriptionBuilder';

interface SopTemplatesProps {
  templates: SOPTemplate[];
  onApplyTemplate: (template: SOPTemplate) => void;
  onEditTemplate: (template: SOPTemplate) => void;
}

const SopTemplates: React.FC<SopTemplatesProps> = ({ templates, onApplyTemplate, onEditTemplate }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  <BookCopy size={18} />
                  {template.name}
                </CardTitle>
                {template.isPublic ? (
                    <div className="flex items-center text-xs text-muted-foreground gap-1"><Globe size={12}/> Public</div>
                ) : (
                    <div className="flex items-center text-xs text-muted-foreground gap-1"><Lock size={12}/> Private</div>
                )}
              </div>
              <CardDescription>{template.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground">
                {template.medicines.slice(0, 3).map((med, index) => (
                  <li key={index}>{med.name}</li>
                ))}
                {template.medicines.length > 3 && <li>...and {template.medicines.length - 3} more</li>}
              </ul>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onEditTemplate(template)}>
                <Edit className="mr-2 h-4 w-4" />
                View/Edit
              </Button>
              <Button onClick={() => onApplyTemplate(template)} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Apply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SopTemplates;
