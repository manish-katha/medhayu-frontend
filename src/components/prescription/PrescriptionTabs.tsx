
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PatientData } from '@/types/patient';
import PrescriptionBuilder, { Medicine, SOPTemplate } from '@/components/prescription/PrescriptionBuilder';
import DiagnosticPrescriptionBuilder from '@/components/prescription/DiagnosticPrescriptionBuilder';
import CustomTestPanel from './CustomTestPanel';
import DietPlanner, { DietTemplate } from './DietPlanner';

const initialDietTemplates: DietTemplate[] = [
  {
    id: 'dt-1',
    name: 'Diabetes Mellitus (Madhumeha) Diet',
    description: 'A diet plan focused on stabilizing blood sugar levels and improving insulin sensitivity.',
    content: `**Foods to Favor (Pathya):**
- Bitter gourd (Karela), Fenugreek (Methi), Turmeric (Haridra)
- Barley (Yava), Green gram (Mudga)
- Leafy green vegetables, Amla

**Foods to Avoid (Apathya):**
- Sugar, Jaggery, and all sweet products
- Rice, Potato, and other high-carbohydrate foods
- Dairy products, especially yogurt
- Fried foods and processed snacks

**Lifestyle Advice:**
- Regular physical activity, such as walking for 30-45 minutes daily.
- Avoid sleeping during the daytime.`
  },
  {
    id: 'dt-2',
    name: 'Rheumatoid Arthritis (Amavata) Diet',
    description: 'An anti-inflammatory diet to reduce joint pain and swelling.',
    content: `**Foods to Favor (Pathya):**
- Warm, light, and easily digestible foods.
- Ginger, Garlic, and Turmeric.
- Soups made from lentils and vegetables.
- Bitter and astringent taste dominant foods.

**Foods to Avoid (Apathya):**
- Heavy, oily, and fried foods.
- Dairy products, especially cheese and yogurt.
- Incompatible food combinations (e.g., milk with fish).
- Excessive consumption of cold foods and drinks.

**Lifestyle Advice:**
- Gentle exercises and yoga.
- Protect yourself from cold wind and weather.`
  },
];

const initialSopTemplates: SOPTemplate[] = [
    {
      id: 'template-1',
      name: 'Vata Kulantaka',
      level: '1',
      levelName: 'Vatakulantaka',
      pattern: 'pattern1',
      patternName: 'Jvara Nashaka',
      category: 'Vata',
      medicines: [
        { id: 1, name: 'Ashwagandha Churna', anupaan: 'Milk', dosage: '1 tsp', timing: 'Morning and Evening', customTiming: '' },
        { id: 2, name: 'Triphala', anupaan: 'Water', dosage: '2 tsp', timing: 'Before sleep', customTiming: '' }
      ],
      specialInstructions: 'Follow the medication timing strictly for best results.',
      dietInstructions: 'Avoid cold foods. Prefer warm, freshly cooked meals. Include ginger in your diet.',
      isPublic: true
    },
    {
      id: 'template-2',
      name: 'Pitta Shamaka',
      level: '2',
      levelName: 'Pittashamaka',
      pattern: 'pattern2',
      patternName: 'Daha Prashaman',
      category: 'Pitta',
      medicines: [
        { id: 1, name: 'Amalaki Churna', anupaan: 'Water', dosage: '1 tsp', timing: 'Morning and Evening', customTiming: '' },
        { id: 2, name: 'Chandraprabha Vati', anupaan: 'Water', dosage: '1 tablet', timing: 'Twice daily', customTiming: '' }
      ],
      specialInstructions: 'Take medication after meals.',
      dietInstructions: 'Avoid spicy, sour, and fermented foods. Include cooling foods like cucumber and coconut water.',
      isPublic: false
    }
  ];


interface PrescriptionTabsProps {
  selectedPatient: PatientData | null;
}

const PrescriptionTabs: React.FC<PrescriptionTabsProps> = ({
  selectedPatient,
}) => {
  const [activeTab, setActiveTab] = useState('medication');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diagnosticTests, setDiagnosticTests] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [dietInstructions, setDietInstructions] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState<Date | undefined>();
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [showDietInstructions, setShowDietInstructions] = useState(false);
  const [dietTemplates, setDietTemplates] = useState<DietTemplate[]>(initialDietTemplates);
  const [sopTemplates, setSopTemplates] = useState<SOPTemplate[]>(initialSopTemplates);
  
  const handleMergeDiagnostics = () => {
    setActiveTab('medication');
  };

  const handleApplyDiet = (dietPlan: string) => {
    setDietInstructions(dietPlan);
    setShowDietInstructions(true);
    setActiveTab('medication');
  };

  if (!selectedPatient) return null;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex justify-center mb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="medication">Medication Prescription</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic Prescription</TabsTrigger>
          <TabsTrigger value="diet">Diet Planner</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="medication">
        <PrescriptionBuilder 
          selectedPatient={selectedPatient}
          medicines={medicines}
          setMedicines={setMedicines}
          diagnosticTests={diagnosticTests}
          setDiagnosticTests={setDiagnosticTests}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
          dietInstructions={dietInstructions}
          setDietInstructions={setDietInstructions}
          nextVisitDate={nextVisitDate}
          setNextVisitDate={setNextVisitDate}
          showSpecialInstructions={showSpecialInstructions}
          setShowSpecialInstructions={setShowSpecialInstructions}
          showDietInstructions={showDietInstructions}
          setShowDietInstructions={setShowDietInstructions}
          dietTemplates={dietTemplates}
          sopTemplates={sopTemplates}
          setSopTemplates={setSopTemplates}
        />
      </TabsContent>
      <TabsContent value="diagnostic">
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="blank" className="mt-4">
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value="blank">Blank Diagnostic</TabsTrigger>
                  <TabsTrigger value="ruleout">Rule-Out Templates</TabsTrigger>
                  <TabsTrigger value="custom">Custom Test Panels</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blank" className="mt-4">
                  <DiagnosticPrescriptionBuilder 
                    selectedPatient={selectedPatient} 
                    selectedTests={diagnosticTests}
                    setSelectedTests={setDiagnosticTests}
                    onMerge={handleMergeDiagnostics}
                  />
                </TabsContent>
                
                <TabsContent value="ruleout" className="mt-4">
                  <DiagnosticPrescriptionBuilder 
                    selectedPatient={selectedPatient} 
                    useTemplates={true} 
                    selectedTests={diagnosticTests}
                    setSelectedTests={setDiagnosticTests}
                    onMerge={handleMergeDiagnostics}
                  />
                </TabsContent>
                <TabsContent value="custom" className="mt-4">
                   <CustomTestPanel 
                    setSelectedTests={setDiagnosticTests}
                    onMerge={handleMergeDiagnostics}
                  />
                </TabsContent>
              </Tabs>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="diet">
        <DietPlanner 
          onApplyDiet={handleApplyDiet}
          dietTemplates={dietTemplates}
          setDietTemplates={setDietTemplates}
          onMerge={handleMergeDiagnostics}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PrescriptionTabs;
