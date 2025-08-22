
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Beaker, FilePlus2, Edit } from 'lucide-react';
import TestSelectionDialog from './TestSelectionDialog';
import CreateTestPanelDialog, { CustomPanelData } from './CreateTestPanelDialog';

const initialCustomTestPanels = [
  {
    id: 'panel-1',
    name: 'Basic Wellness Panel',
    description: 'A general set of tests for routine health checkups.',
    tests: ['Complete Blood Count (CBC)', 'Lipid Profile', 'Liver Function Test (LFT)', 'Renal Function Test (RFT)', 'Blood Sugar (Fasting, Postprandial, Random)'],
  },
  {
    id: 'panel-2',
    name: 'Fever Panel',
    description: 'Tests to diagnose common causes of fever.',
    tests: ['CBC', 'ESR', 'Malaria Parasite Smear / Rapid Test', 'Widal Test', 'Dengue NS1 Antigen, IgM, IgG', 'Urine Routine & Microscopy'],
  },
  {
    id: 'panel-3',
    name: 'Joint Pain Panel',
    description: 'Investigation for common causes of joint pain and arthritis.',
    tests: ['CBC', 'ESR', 'C-Reactive Protein (CRP)', 'Rheumatoid Factor (RA Factor)', 'Anti-CCP', 'Uric Acid', 'X-Ray (Specify Joint/Bone)'],
  },
  {
    id: 'panel-4',
    name: 'Thyroid Panel',
    description: 'Comprehensive evaluation of thyroid function.',
    tests: ['TSH', 'Free T3', 'Free T4', 'Anti-TPO Antibodies', 'USG Neck / Thyroid'],
  },
];

interface CustomTestPanelProps {
  setSelectedTests: React.Dispatch<React.SetStateAction<string[]>>;
  onMerge: () => void;
}

const CustomTestPanel: React.FC<CustomTestPanelProps> = ({ setSelectedTests, onMerge }) => {
  const { toast } = useToast();
  const [customTestPanels, setCustomTestPanels] = useState(initialCustomTestPanels);
  const [selectedPanel, setSelectedPanel] = useState<(typeof customTestPanels)[0] | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleApplyAll = (panel: typeof customTestPanels[0]) => {
    setSelectedTests(prevTests => {
      const newTests = new Set([...prevTests, ...panel.tests]);
      return Array.from(newTests);
    });
    
    toast({
      title: 'Panel Applied',
      description: `All tests from "${panel.name}" have been added to the prescription.`,
    });
    
    onMerge();
  };

  const handleSelectAndMerge = (tests: string[]) => {
    setSelectedTests(prevTests => {
      const newTests = new Set([...prevTests, ...tests]);
      return Array.from(newTests);
    });
    onMerge();
  };

  const handleCreatePanel = (newPanelData: CustomPanelData) => {
    const newPanel = {
      id: `panel-${Date.now()}`,
      ...newPanelData,
    };
    setCustomTestPanels(prevPanels => [...prevPanels, newPanel]);
    toast({
      title: "Custom Panel Created",
      description: `The "${newPanel.name}" panel has been saved.`,
    });
    setIsCreateDialogOpen(false);
  };


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customTestPanels.map((panel) => (
          <Card key={panel.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker size={18} />
                {panel.name}
              </CardTitle>
              <CardDescription>{panel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground">
                {panel.tests.slice(0, 3).map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
                {panel.tests.length > 3 && <li>...and {panel.tests.length - 3} more</li>}
              </ul>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setSelectedPanel(panel)}>
                <Edit className="mr-2 h-4 w-4" />
                View & Select
              </Button>
              <Button onClick={() => handleApplyAll(panel)} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add All
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t">
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Custom Panel
        </Button>
      </div>

      <TestSelectionDialog
        panel={selectedPanel}
        onClose={() => setSelectedPanel(null)}
        onAddSelected={handleSelectAndMerge}
      />
      
      <CreateTestPanelDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreatePanel}
      />
    </div>
  );
};

export default CustomTestPanel;
