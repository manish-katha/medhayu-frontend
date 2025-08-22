
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save,
  Lock,
  Globe,
  FilePlus2,
  Eye,
  ArrowLeft,
  ChevronsUpDown,
  Check,
  X,
  Beaker,
  Calendar as CalendarIcon,
  Sparkles,
  BookCopy,
  Loader2
} from 'lucide-react';
import { useForm, useActionState } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { PatientData } from '@/types/patient';
import { anupanas } from '@/data/anupanas';
import { medicines as medicineData } from '@/data/medicines';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import GeneratedPrescription from './GeneratedPrescription';
import { Autocomplete } from '@/components/ui/autocomplete';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import type { DietTemplate } from './DietPlanner';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import SopTemplates from './SopTemplates';
import { Switch } from '@/components/ui/switch';
import { createPrescriptionAndVisit } from '@/actions/prescription.actions';


export interface Medicine {
  id: number;
  name: string;
  anupaan: string;
  dosage: string;
  timing: string;
  customTiming?: string;
  customAnupaan?: string;
  form?: 'tablet' | 'capsule' | 'powder' | 'churna' | 'liquid' | 'syrup' | 'oil' | 'other';
}

export interface SOPTemplate {
  id: string;
  name: string;
  level: string;
  levelName: string;
  pattern: string;
  patternName: string;
  category: string;
  medicines: Medicine[];
  specialInstructions: string;
  dietInstructions: string;
  isPublic: boolean;
  description?: string;
}

const sopTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  level: z.string().min(1, "Level is required"),
  levelName: z.string().min(1, "Level name is required"),
  pattern: z.string().min(1, "Pattern is required"),
  patternName: z.string().min(1, "Pattern name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const timingOptions = [
    { value: "1-1-1", label: "1-1-1 (Thrice a day)" },
    { value: "1-0-1", label: "1-0-1 (Twice a day, morning & night)" },
    { value: "1-1-0", label: "1-1-0 (Twice a day, morning & noon)" },
    { value: "0-1-1", label: "0-1-1 (Twice a day, noon & night)" },
    { value: "1-0-0", label: "1-0-0 (Once a day, morning)" },
    { value: "0-1-0", label: "0-1-0 (Once a day, noon)" },
    { value: "0-0-1", label: "0-0-1 (Once a day, night)" },
    { value: "Before Food", label: "Before Food" },
    { value: "After Food", label: "After Food" },
    { value: "With Food", label: "With Food" },
    { value: "SOS", label: "SOS (As needed)" },
    { value: "Custom", label: "Custom..." },
];

const anupaanOptions = [...anupanas, "Custom"];

interface PrescriptionBuilderProps {
    selectedPatient: PatientData | null;
    medicines: Medicine[];
    setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
    diagnosticTests: string[];
    setDiagnosticTests: React.Dispatch<React.SetStateAction<string[]>>;
    specialInstructions: string;
    setSpecialInstructions: React.Dispatch<React.SetStateAction<string>>;
    dietInstructions: string;
    setDietInstructions: React.Dispatch<React.SetStateAction<string>>;
    nextVisitDate: Date | undefined;
    setNextVisitDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    showSpecialInstructions: boolean;
    setShowSpecialInstructions: React.Dispatch<React.SetStateAction<boolean>>;
    showDietInstructions: boolean;
    setShowDietInstructions: React.Dispatch<React.SetStateAction<boolean>>;
    dietTemplates: DietTemplate[];
    sopTemplates: SOPTemplate[];
    setSopTemplates: React.Dispatch<React.SetStateAction<SOPTemplate[]>>;
}

const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({ 
    selectedPatient, 
    medicines,
    setMedicines,
    diagnosticTests,
    setDiagnosticTests,
    specialInstructions,
    setSpecialInstructions,
    dietInstructions,
    setDietInstructions,
    nextVisitDate,
    setNextVisitDate,
    showSpecialInstructions,
    setShowSpecialInstructions,
    showDietInstructions,
    setShowDietInstructions,
    dietTemplates,
    sopTemplates,
    setSopTemplates,
}) => {
  const { toast } = useToast();
  
  const [showGeneratedPrescription, setShowGeneratedPrescription] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('manual-builder');
  
  const [categories, setCategories] = useState<string[]>(["General", "Vata", "Pitta", "Kapha", "Digestive", "Respiratory"]);
  const [patterns, setPatterns] = useState<string[]>(["Pattern 1", "Pattern 2", "Pattern 3"]);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  
  const [templateMedicines, setTemplateMedicines] = useState<Medicine[]>([]);
  const [trackProgress, setTrackProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const templateForm = useForm<z.infer<typeof sopTemplateSchema>>({
    resolver: zodResolver(sopTemplateSchema),
    defaultValues: {
      name: "",
      level: "1",
      levelName: "",
      pattern: "pattern1",
      patternName: "",
      category: "General",
      description: "",
      isPublic: false,
    },
  });

  const addMedicineToTemplate = () => {
    const newId = templateMedicines.length > 0 ? 
      Math.max(...templateMedicines.map(m => m.id)) + 1 : 1;
    setTemplateMedicines([...templateMedicines, { id: newId, name: '', anupaan: '', dosage: '', timing: '', customTiming: '', customAnupaan: '' }]);
  };
  
  const removeMedicineFromTemplate = (id: number) => {
    setTemplateMedicines(templateMedicines.filter(m => m.id !== id));
  };

  const handleTemplateMedicineChange = (id: number, field: keyof Medicine, value: string) => {
     setTemplateMedicines(prevMeds => prevMeds.map(med => {
        if (med.id === id) {
          const updatedMed = { ...med, [field]: value };
          if (field === 'name') {
            const medInfo = medicineData.find(m => m.name === value);
            if (medInfo) {
              updatedMed.form = medInfo.form;
              switch (medInfo.form) {
                case 'tablet':
                case 'capsule':
                  updatedMed.dosage = `1 ${medInfo.form}`;
                  break;
                case 'liquid':
                case 'syrup':
                case 'oil':
                  updatedMed.dosage = '5 ml';
                  break;
                case 'powder':
                case 'churna':
                  updatedMed.dosage = '1 tsp';
                  break;
                default:
                  updatedMed.dosage = '';
              }
            } else {
              updatedMed.form = 'other';
              updatedMed.dosage = '';
            }
          }
          return updatedMed;
        }
        return med;
      }));
  };
  
  const addMedicine = () => {
    const newId = medicines.length > 0 ? 
      Math.max(...medicines.map(m => m.id)) + 1 : 1;
    setMedicines([...medicines, { id: newId, name: '', anupaan: '', dosage: '', timing: '', customTiming: '', customAnupaan: '' }]);
  };
  
  const removeMedicine = (id: number) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };
  
  const handleMedicineChange = (id: number, field: keyof Medicine, value: string) => {
    setMedicines(prevMeds =>
      prevMeds.map(medicine => {
        if (medicine.id === id) {
          const updatedMed = { ...medicine, [field]: value };
          if (field === 'name') {
            const medInfo = medicineData.find(m => m.name === value);
            if (medInfo) {
              updatedMed.form = medInfo.form;
              switch (medInfo.form) {
                case 'tablet':
                case 'capsule':
                  updatedMed.dosage = `1 ${medInfo.form}`;
                  break;
                case 'liquid':
                case 'syrup':
                case 'oil':
                  updatedMed.dosage = '5 ml';
                  break;
                case 'powder':
                case 'churna':
                  updatedMed.dosage = '1 tsp';
                  break;
                default:
                  updatedMed.dosage = '';
              }
            } else {
              updatedMed.form = 'other';
              updatedMed.dosage = '';
            }
          }
          return updatedMed;
        }
        return medicine;
      })
    );
  };
  
  const openSaveTemplateDialog = () => {
    const validMedicines = medicines.filter(med => med.name && med.name.trim() !== "");
    
    if (validMedicines.length === 0) {
      toast({
        title: "No medicines to save",
        description: "Please add at least one medicine before saving a template.",
        variant: "destructive"
      });
      return;
    }

    setTemplateMedicines(validMedicines);
    
    templateForm.reset({
      name: "",
      level: "1",
      levelName: "",
      pattern: "pattern1",
      patternName: "",
      category: "General",
      description: "",
      isPublic: false,
    });
    
    setIsSaveTemplateDialogOpen(true);
  };
  
  const saveTemplate = (data: z.infer<typeof sopTemplateSchema>) => {
    const newTemplate: SOPTemplate = {
      id: `template-${Date.now()}`,
      name: data.name,
      level: data.level,
      levelName: data.levelName,
      pattern: data.pattern,
      patternName: data.patternName,
      category: data.category,
      medicines: templateMedicines, // Use medicines from the dialog state
      specialInstructions,
      dietInstructions,
      isPublic: data.isPublic,
      description: data.description,
    };
    
    setSopTemplates([...sopTemplates, newTemplate]);
    if (!patterns.includes(data.pattern)) {
      setPatterns(prev => [...prev, data.pattern]);
    }
    if (!categories.includes(data.category)) {
      setCategories(prev => [...prev, data.category]);
    }

    setIsSaveTemplateDialogOpen(false);
    setTemplateMedicines([]);
    
    toast({
      title: "Template Saved",
      description: `${data.name} has been saved to your templates`,
    });
  };
  
  const applyTemplate = (template: SOPTemplate) => {
    setMedicines(template.medicines);
    setSpecialInstructions(template.specialInstructions);
    setDietInstructions(template.dietInstructions);
    
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied`,
    });

    // Switch back to the manual builder tab after applying a template
    setActiveTab('manual-builder');
  };

  const handleGeneratePrescription = async (isPreview: boolean) => {
    if (!selectedPatient) {
      toast({ title: 'Patient required', description: 'Please select a patient first.', variant: 'destructive' });
      return;
    }
    
    if (medicines.length === 0 && diagnosticTests.length === 0) {
      toast({ title: 'Empty Prescription', description: 'Please add at least one medicine or diagnostic test.', variant: 'destructive' });
      return;
    }

    if (medicines.some(med => !med.name)) {
      toast({ title: 'Incomplete Medicines', description: 'Please fill in all medicine details.', variant: 'destructive' });
      return;
    }
    
    if(isPreview) {
      setShowPreview(true);
      setShowGeneratedPrescription(true);
    } else {
        setIsSubmitting(true);
        const result = await createPrescriptionAndVisit({
            patientId: selectedPatient.id,
            clinicId: '689d65b7ae23724801cc6a4b', // This needs to be dynamic
            medicines,
            diagnosticTests,
            specialInstructions,
            dietInstructions,
            nextVisitDate,
            trackProgress,
        });
        setIsSubmitting(false);

        if(result.success) {
            setShowPreview(false);
            setShowGeneratedPrescription(true);
        } else {
            toast({ title: "Failed to save prescription", description: result.error, variant: "destructive" });
        }
    }
  };
  
  const removeDiagnosticTest = (indexToRemove: number) => {
    setDiagnosticTests(diagnosticTests.filter((_, index) => index !== indexToRemove));
  };


  return (
    <>
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual-builder">Manual Builder</TabsTrigger>
                  <TabsTrigger value="sop-templates">SOP Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="manual-builder" className="pt-4">
                  <div className="space-y-4">
                      {medicines.map((medicine) => (
                          <div key={medicine.id} className="relative grid grid-cols-12 gap-2 mb-3 p-3 border rounded-md bg-background pr-8 items-end">
                          <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeMedicine(medicine.id)}
                              className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                              <X size={14} />
                          </Button>
                          <div className="col-span-12 md:col-span-3">
                              <Label htmlFor={`medicine-name-${medicine.id}`} className="text-xs">Medicine Name</Label>
                              <Autocomplete
                                  options={medicineData.map(m => ({ value: m.name, label: m.name }))}
                                  value={medicine.name}
                                  onValueChange={(value) => handleMedicineChange(medicine.id, 'name', value)}
                                  placeholder="e.g., Ashwagandha Churna"
                              />
                              </div>
                              <div className="col-span-6 md:col-span-2">
                                  <Label htmlFor={`anupaan-${medicine.id}`} className="text-xs text-center block">Anupaan</Label>
                              {renderAnupaanField(medicine, handleMedicineChange)}
                              </div>
                              <div className="col-span-6 md:col-span-2">
                              <Label htmlFor={`dosage-${medicine.id}`} className="text-xs text-center block">Dosage</Label>
                              <Input 
                                  id={`dosage-${medicine.id}`} 
                                  placeholder="e.g., 1 tsp"
                                  value={medicine.dosage}
                                  onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                              />
                              </div>
                              <div className="col-span-12 md:col-span-5 flex items-end gap-2">
                                  <div className="w-full">
                                  <Label htmlFor={`timing-${medicine.id}`} className="text-xs text-center block">Timing</Label>
                                  {renderTimingField(medicine, handleMedicineChange)}
                                  </div>
                              </div>
                          </div>
                      ))}
                      <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addMedicine} 
                          className="w-full flex items-center text-ayurveda-green border-ayurveda-green/20 hover:text-ayurveda-green hover:bg-ayurveda-green/10 border-dashed"
                      >
                          <Plus size={14} className="mr-1" />
                          {medicines.length === 0 ? 'Add Medicine' : 'Add Another Medicine'}
                      </Button>
                      
                      {diagnosticTests.length > 0 && (
                          <div className="space-y-2 pt-4 mt-4 border-t">
                              <h3 className="text-base font-semibold flex items-center gap-2">
                              <Beaker size={18} />
                              Diagnostic Tests
                              </h3>
                              <ul className="space-y-2">
                              {diagnosticTests.map((test, index) => (
                                  <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span>{test}</span>
                                  <Button 
                                      onClick={() => removeDiagnosticTest(index)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                  >
                                      <Trash2 size={14} />
                                  </Button>
                                  </li>
                              ))}
                              </ul>
                          </div>
                      )}
                  </div>
              </TabsContent>
              <TabsContent value="sop-templates" className="pt-4">
                   <SopTemplates 
                      templates={sopTemplates}
                      onApplyTemplate={applyTemplate}
                      onEditTemplate={openSaveTemplateDialog}
                   />
                   <div className="flex justify-center pt-4 mt-4 border-t">
                      <Button variant="outline" onClick={openSaveTemplateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New SOP Template
                      </Button>
                    </div>
              </TabsContent>
          </Tabs>
        </CardContent>
        <CardContent className="pt-0">
        
         <div className="mb-4">
          <Label htmlFor="next-visit-date" className="text-base font-semibold">
              Next Visit Date
          </Label>
           <div className="mt-2 text-sm">
            {nextVisitDate ? (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                  <p className="flex-grow">
                  You are advised to meet the doctor next week on{' '}
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="link" className="p-0 h-auto font-bold">
                              {format(nextVisitDate, "PPP")}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar
                              mode="single"
                              selected={nextVisitDate}
                              onSelect={setNextVisitDate}
                              initialFocus
                          />
                      </PopoverContent>
                  </Popover>
                  . Please ensure you book your appointment in advance.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setNextVisitDate(undefined)} className="text-destructive hover:text-destructive">
                      Clear
                  </Button>
              </div>
            ) : (
              <Popover>
                  <PopoverTrigger asChild>
                  <Button
                      variant={"outline"}
                      className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !nextVisitDate && "text-muted-foreground"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                  </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                  <Calendar
                      mode="single"
                      selected={nextVisitDate}
                      onSelect={setNextVisitDate}
                      initialFocus
                  />
                  </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
         <div className="mb-6 space-y-4">
          {(!showSpecialInstructions && !showDietInstructions) ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Button variant="outline" onClick={() => setShowSpecialInstructions(true)} className="w-full">
                 <Plus size={16} className="mr-2" />
                 Add Special Instructions
               </Button>
               <Button variant="outline" onClick={() => setShowDietInstructions(true)} className="w-full">
                 <Plus size={16} className="mr-2" />
                 Add Diet Instructions
               </Button>
             </div>
          ) : (
            <>
              {showSpecialInstructions && (
                <div className="relative space-y-2 border rounded-md p-4 pt-8">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSpecialInstructions(false)}
                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </Button>
                  <Label htmlFor="special-instructions">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Enter any special instructions or notes"
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>
              )}
               {showDietInstructions && (
                  <div className="relative space-y-2 border rounded-md p-4 pt-8">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowDietInstructions(false)}
                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <X size={14} />
                      </Button>
                      <Label htmlFor="diet-instructions">
                          Diet Instructions
                      </Label>
                      <Textarea
                      id="diet-instructions"
                      placeholder="Enter diet instructions or generate them using AI"
                      rows={3}
                      className="mt-2"
                      value={dietInstructions}
                      onChange={(e) => setDietInstructions(e.target.value)}
                      />
                  </div>
              )}
              
              {(!showSpecialInstructions && showDietInstructions) && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setShowSpecialInstructions(true)} className="w-full md:w-auto">
                        <Plus size={16} className="mr-2" />
                        Add Special Instructions
                    </Button>
                </div>
              )}
              {(showSpecialInstructions && !showDietInstructions) && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setShowDietInstructions(true)} className="w-full md:w-auto">
                        <Plus size={16} className="mr-2" />
                        Add Diet Instructions
                    </Button>
                </div>
              )}
            </>
          )}
        </div>
  
        <div className="flex justify-between border-t p-4">
          <div className="flex items-center space-x-2">
            <Switch id="track-progress" checked={trackProgress} onCheckedChange={setTrackProgress} />
            <Label htmlFor="track-progress">Track this Condition's Progress</Label>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => handleGeneratePrescription(true)}
              className="flex items-center"
            >
              <Eye size={16} className="mr-1" /> Preview
            </Button>
            <Button 
              variant="outline" 
              className="border-ayurveda-green text-ayurveda-green hover:bg-ayurveda-green/10"
              onClick={openSaveTemplateDialog}
            >
              <FilePlus2 size={16} className="mr-1" /> Save as Template
            </Button>
            <Button 
              className="bg-ayurveda-green hover:bg-ayurveda-green/90"
              onClick={() => handleGeneratePrescription(false)}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
              Generate Prescription
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save the current prescription as a reusable SOP template.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...templateForm}>
          <form onSubmit={templateForm.handleSubmit(saveTemplate)} className="space-y-4">
            <FormField
              control={templateForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Standard Vata Protocol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="my-4">
                <Label>Medicines in Template</Label>
                <div className="mt-2 space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">
                {templateMedicines.map((medicine, index) => (
                    <div key={medicine.id} className="relative grid grid-cols-12 gap-2 p-3 bg-muted/50 rounded-md items-end pr-8">
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => removeMedicineFromTemplate(medicine.id)}
                      >
                        <X size={14} />
                      </Button>
                        <div className="col-span-12 md:col-span-3">
                            <Label htmlFor={`template-med-name-${medicine.id}`} className="text-xs">Medicine</Label>
                            <Autocomplete
                                  options={medicineData.map(m => ({value: m.name, label: m.name}))}
                                  value={medicine.name}
                                  onValueChange={(value) => handleTemplateMedicineChange(medicine.id, 'name', value)}
                                  placeholder="Medicine Name"
                                  className="h-9"
                            />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                            <Label htmlFor={`template-med-dosage-${medicine.id}`} className="text-xs">Dosage</Label>
                            <Input
                                id={`template-med-dosage-${medicine.id}`}
                                placeholder="Dosage"
                                value={medicine.dosage}
                                onChange={(e) => handleTemplateMedicineChange(medicine.id, 'dosage', e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="col-span-6 md:col-span-3">
                            <Label htmlFor={`template-med-timing-${medicine.id}`} className="text-xs">Timing</Label>
                            {renderTimingField(medicine, (id, field, value) => handleTemplateMedicineChange(id, field as keyof Medicine, value))}
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Label htmlFor={`template-med-anupaan-${medicine.id}`} className="text-xs">Anupaan</Label>
                            {renderAnupaanField(medicine, (id, field, value) => handleTemplateMedicineChange(id, field as keyof Medicine, value))}
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={addMedicineToTemplate}>
                    <Plus size={14} className="mr-2"/> Add Medicine to Template
                 </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={templateForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Level 1 - Initial</SelectItem>
                        <SelectItem value="2">Level 2 - Progressive</SelectItem>
                        <SelectItem value="3">Level 3 - Intermediate</SelectItem>
                        <SelectItem value="4">Level 4 - Advanced</SelectItem>
                        <SelectItem value="5">Level 5 - Palliative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="levelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vatakulantaka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={templateForm.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern</FormLabel>
                    <Autocomplete
                      options={patterns.map(p => ({value: p, label: p}))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onCreateNew={(newValue) => {
                        setPatterns(prev => [...prev, newValue]);
                        field.onChange(newValue);
                      }}
                      placeholder="Select or create pattern"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="patternName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jvara Nashaka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={templateForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Autocomplete
                      options={categories.map(c => ({value: c, label: c}))}
                      value={field.value}
                      onValueChange={field.onChange}
                      onCreateNew={(newValue) => {
                          setCategories(prev => [...prev, newValue]);
                          field.onChange(newValue);
                      }}
                      placeholder="Select or create category"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={templateForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description of this template" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={templateForm.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                     <FormLabel>Make this template public</FormLabel>
                     <FormDescription>
                      Share this template with the community.
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90">
                <Save size={14} className="mr-1" /> Save Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    <GeneratedPrescription
      isOpen={showGeneratedPrescription}
      onClose={() => setShowGeneratedPrescription(false)}
      patient={selectedPatient}
      medicines={medicines}
      diagnosticTests={diagnosticTests}
      specialInstructions={specialInstructions}
      dietInstructions={dietInstructions}
      nextVisitDate={nextVisitDate}
      showPreview={showPreview}
    />
  </>
  );
};

export default PrescriptionBuilder;

const renderAnupaanField = (medicine: Medicine, handleChange: (id: number, field: 'anupaan' | 'customAnupaan', value: string) => void) => {
  if (medicine.anupaan === 'Custom') {
    return (
      <div className="flex items-center gap-1">
        <Input 
          placeholder="Custom Anupaan"
          value={medicine.customAnupaan}
          onChange={(e) => handleChange(medicine.id, 'customAnupaan', e.target.value)}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(medicine.id, 'anupaan', '')}><ArrowLeft size={14} /></Button>
      </div>
    );
  }
  return (
      <Select onValueChange={(value) => handleChange(medicine.id, 'anupaan', value)} value={medicine.anupaan}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-60">
            {anupaanOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
  );
};

const renderTimingField = (medicine: Medicine, handleChange: (id: number, field: 'timing' | 'customTiming', value: string) => void) => {
  if (medicine.timing === 'Custom') {
    return (
      <div className="flex items-center gap-1">
        <Input 
          placeholder="e.g., With breakfast"
          value={medicine.customTiming}
          onChange={(e) => handleChange(medicine.id, 'customTiming', e.target.value)}
        />
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleChange(medicine.id, 'timing', '')}><ArrowLeft size={14} /></Button>
      </div>
    );
  }
  return (
      <Select onValueChange={(value) => handleChange(medicine.id, 'timing', value)} value={medicine.timing}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          {timingOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
};
