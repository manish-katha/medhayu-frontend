
'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Share, Send, FileText, Pill, Beaker, Leaf, Heart, QrCode, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getPrescriptionSettings } from '@/actions/settings.actions';
import type { PrescriptionSettings } from '@/types/prescription';


interface Medicine {
  id: number;
  name: string;
  anupaan: string;
  dosage: string;
  timing: string;
  customTiming?: string;
  customAnupaan?: string;
}

interface PatientData {
  id: number;
  oid?: string | null;
  cin?: string | null;
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition?: string;
  email?: string;
  address?: string;
}

interface GeneratedPrescriptionContentProps {
  patient: PatientData | null;
  medicines: Medicine[];
  diagnosticTests: string[];
  specialInstructions: string;
  dietInstructions: string;
  nextVisitDate?: Date;
}

export const GeneratedPrescriptionContent: React.FC<GeneratedPrescriptionContentProps> = ({
    patient,
    medicines,
    diagnosticTests,
    specialInstructions,
    dietInstructions,
    nextVisitDate,
}) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<PrescriptionSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getPrescriptionSettings()
            .then(data => {
                setSettings(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load settings", err);
                toast({ title: 'Could not load prescription settings', variant: 'destructive' });
                setIsLoading(false);
            });
    }, [toast]);
    
    if (isLoading) {
        return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!settings || !patient) {
        return <div className="h-96 flex items-center justify-center">Failed to load prescription design or patient data.</div>;
    }

    const hasMedicines = medicines.length > 0;
    const hasTests = diagnosticTests.length > 0;
    const hasDiet = dietInstructions.trim().length > 0;
    const hasInstructions = specialInstructions.trim().length > 0;

    const Section = ({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) => (
        <div className="flex items-start gap-4">
            <div className={cn("p-2 rounded-full", color)}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-headline font-semibold text-gray-800 mb-2">{title}</h3>
                <div className="text-sm text-gray-600 space-y-2 font-body">
                {children}
                </div>
            </div>
        </div>
    );

    return (
        <div id="prescription-content" className="bg-white p-8 font-sans text-gray-700 shadow-md rounded-lg max-w-3xl mx-auto" style={{ backgroundColor: settings.bodyBackground }}>
            {!settings.useLetterhead && (
                <div 
                  className={`p-6 border-b ${settings.headerBorderStyle}`}
                  style={{ 
                    backgroundColor: settings.headerBackground,
                    textAlign: settings.headerAlignment as any,
                    borderColor: settings.accentColor
                  }}
                >
                  {settings.showLogo && (
                    <div 
                      className={`flex items-center mb-4 ${
                        settings.logoPlacement === 'left' ? 'justify-start' : 
                        settings.logoPlacement === 'right' ? 'justify-end' : 
                        'justify-center'
                      }`}
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        Logo
                      </div>
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold" style={{ color: settings.accentColor, fontFamily: settings.fontFamily }}>
                    Oshadham Ayurveda Clinic
                  </h1>
                  <p className="text-lg font-medium mt-1" style={{ color: settings.textColor, fontFamily: settings.fontFamily }}>
                    Dr. Acharya Sharma
                  </p>
                  {settings.addressPlacement === 'header' && (
                    <p className="text-sm mt-2" style={{ color: settings.textColor, fontFamily: settings.fontFamily }}>
                      123 Healing Path, Ayurveda Nagar, Bangalore - 560001
                    </p>
                  )}
                  {settings.contactPlacement === 'header' && (
                    <p className="text-sm mt-1" style={{ color: settings.textColor, fontFamily: settings.fontFamily }}>
                      +91 98765 43210 | info@oshadham.com | www.oshadham.com
                    </p>
                  )}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 my-6 py-4 px-6 rounded-lg bg-ayurveda-green/5 border" style={{borderColor: settings.accentColor}}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{color: settings.accentColor}}>Patient</p>
                <p className="font-medium">{patient.name}</p>
                <p className="font-mono text-xs">{patient.cin || patient.oid}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{color: settings.accentColor}}>Age & Gender</p>
                <p className="font-medium">{patient.age} / {patient.gender}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{color: settings.accentColor}}>Date</p>
                <p className="font-medium">{format(new Date(), 'dd MMM, yyyy')}</p>
              </div>
            </div>
            
            <div className="space-y-8" style={{color: settings.textColor, fontFamily: settings.fontFamily}}>
              {hasMedicines && (
                <Section icon={<Pill className="text-white" size={20}/>} title="Prescription (Rx)" color="bg-ayurveda-green">
                  <table className="w-full text-left border-separate border-spacing-y-1">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="font-normal pb-1">Medicine</th>
                        <th className="font-normal pb-1">Dosage</th>
                        <th className="font-normal pb-1">Timing</th>
                        <th className="font-normal pb-1">Anupāna</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med) => (
                      <tr key={med.id}>
                          <td className="py-2 pr-2 font-medium">{med.name}</td>
                          <td className="py-2 pr-2">{med.dosage}</td>
                          <td className="py-2 pr-2">{med.timing === 'Custom' ? med.customTiming : med.timing}</td>
                          <td className="py-2">{med.anupaan === 'Custom' ? med.customAnupaan : med.anupaan}</td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}
              {hasTests && (
                <Section icon={<Beaker className="text-white" size={20}/>} title="Investigations Advised" color="bg-ayurveda-ochre">
                  <ul className="list-disc list-inside columns-2">
                    {diagnosticTests.map((test, index) => (
                      <li key={index}>{test}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {hasDiet && (
                 <Section icon={<Leaf className="text-white" size={20}/>} title="Dietary Advice (Pathya)" color="bg-ayurveda-terracotta">
                  <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: dietInstructions.replace(/\n/g, '<br />') }} />
                </Section>
              )}
              {hasInstructions && (
                <Section icon={<Heart className="text-white" size={20}/>} title="Special Instructions" color="bg-ayurveda-brown">
                  <p className="whitespace-pre-wrap">{specialInstructions}</p>
                </Section>
              )}
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-end">
                {/* Footer content from preview */}
            </div>
        </div>
    );
};


interface GeneratedPrescriptionProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData | null;
  medicines: Medicine[];
  diagnosticTests: string[];
  specialInstructions: string;
  dietInstructions: string;
  nextVisitDate?: Date;
  showPreview: boolean;
}

const GeneratedPrescription: React.FC<GeneratedPrescriptionProps> = ({
  isOpen,
  onClose,
  patient,
  medicines,
  diagnosticTests,
  specialInstructions,
  dietInstructions,
  nextVisitDate,
  showPreview
}) => {
  const { toast } = useToast();
  
  const handlePrint = () => {
    toast({
      title: "Printing Prescription",
      description: "Sending prescription to printer...",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {showPreview ? "Prescription Preview" : "Generated Prescription"}
          </DialogTitle>
           <DialogDescription>
            {showPreview 
              ? "Preview how the prescription will look when generated" 
              : "Generated prescription ready to print or share"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-100/50">
            <GeneratedPrescriptionContent
                patient={patient}
                medicines={medicines}
                diagnosticTests={diagnosticTests}
                specialInstructions={specialInstructions}
                dietInstructions={dietInstructions}
                nextVisitDate={nextVisitDate}
            />
        </div>

        <DialogFooter className="p-4 border-t bg-background">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!showPreview && (
            <div className="flex gap-2">
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer size={16} className="mr-1" /> Print
                </Button>
                <Button variant="outline">
                    <Send size={16} className="mr-1" /> Send via WhatsApp
                </Button>
                <Button variant="default">
                    <FileText size={16} className="mr-1" /> Save as PDF
                </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedPrescription;
