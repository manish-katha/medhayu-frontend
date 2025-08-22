
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ClipboardCheck, FilePlus2 } from 'lucide-react';
import { PatientData } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { diseaseTestTemplates, DiseaseTemplate } from '@/data/diseaseTestTemplates';
import { masterDiagnosticTests } from '@/data/diagnosticTests';
import { Autocomplete } from '@/components/ui/autocomplete';
import GeneratedPrescription from './GeneratedPrescription';

interface DiagnosticPrescriptionBuilderProps {
  selectedPatient: PatientData | null;
  useTemplates?: boolean;
  selectedTests: string[];
  setSelectedTests: React.Dispatch<React.SetStateAction<string[]>>;
  onMerge: () => void;
}

const DiagnosticPrescriptionBuilder: React.FC<DiagnosticPrescriptionBuilderProps> = ({
  selectedPatient,
  useTemplates = false,
  selectedTests,
  setSelectedTests,
  onMerge,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseTemplate | null>(null);
  const [filteredDiseases, setFilteredDiseases] = useState<DiseaseTemplate[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customTest, setCustomTest] = useState("");
  const [showGenerated, setShowGenerated] = useState(false);

  // Filter diseases based on search term, including aliases
  useEffect(() => {
    if (!useTemplates || searchTerm.trim() === "") {
      setFilteredDiseases([]);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = diseaseTestTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerCaseSearch) ||
      template.aliases.some(alias => alias.toLowerCase().includes(lowerCaseSearch))
    );
    setFilteredDiseases(filtered);
  }, [searchTerm, useTemplates]);

  // Select disease and populate tests
  const handleDiseaseSelect = (template: DiseaseTemplate) => {
    setSelectedDisease(template);
    setSelectedTests(template.tests.slice());
    setSearchTerm(template.name);
    setShowDropdown(false);
    onMerge(); // Switch back to the main builder
  };

  // Remove test from selected tests
  const removeTest = (index: number) => {
    const updatedTests = [...selectedTests];
    updatedTests.splice(index, 1);
    setSelectedTests(updatedTests);
  };

  const handleTestSelect = (test: string) => {
    if (test && !selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test]);
    }
    setCustomTest("");
  }
  
  // Add custom test
  const addCustomTest = () => {
    if (customTest.trim() !== "" && !selectedTests.includes(customTest.trim())) {
      setSelectedTests([...selectedTests, customTest.trim()]);
      setCustomTest("");
    }
  };


  // Generate prescription
  const generatePrescription = () => {
    if (!selectedPatient) {
        toast({ title: 'Patient required', description: 'Please select a patient first.', variant: 'destructive' });
        return;
    }
    if (selectedTests.length === 0) {
        toast({ title: 'No tests selected', description: 'Please add at least one test.', variant: 'destructive' });
        return;
    }
    setShowGenerated(true);
  };

  // Merge with medication prescription
  const mergeWithMeds = () => {
    onMerge();
    toast({
      title: "Prescription Merged",
      description: "Diagnostic tests added to medication prescription",
    });
  };

  return (
    <>
    <div className="space-y-6">
      {useTemplates && (
        <>
          <h3 className="text-lg font-semibold">Rule-Out Templates</h3>
          
          {/* Disease Search */}
          <div className="relative mb-6">
            <div className="flex items-center border rounded-md overflow-hidden">
              <div className="px-3 py-2 bg-gray-100">
                <Search size={20} className="text-gray-500" />
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onClick={() => setShowDropdown(true)}
                placeholder="Type disease name or synonym (e.g., Madhumeha)..."
                className="border-0"
              />
            </div>
            
            {/* Disease Dropdown */}
            {showDropdown && filteredDiseases.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                {filteredDiseases.map((template) => (
                  <div
                    key={template.name}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleDiseaseSelect(template)}
                  >
                    {template.name} 
                    <span className="text-xs text-muted-foreground ml-2">({template.aliases.join(', ')})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Disease Info */}
          {selectedDisease && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Selected: {selectedDisease.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedTests.length} tests recommended for rule-out diagnosis
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Tests List */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Diagnostic Tests:</h3>
        {selectedTests.length > 0 ? (
          <ul className="space-y-2">
            {selectedTests.map((test, index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{test}</span>
                <Button 
                  onClick={() => removeTest(index)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No tests selected</p>
        )}
      </div>
      
      {/* Add Custom Test */}
      <div className="mb-6 flex space-x-2">
         <Autocomplete
          options={masterDiagnosticTests}
          value={customTest}
          onValueChange={setCustomTest}
          onSelect={handleTestSelect}
          placeholder="Search or add a new test..."
          className="flex-1"
        />
        <Button
          onClick={addCustomTest}
          className="bg-ayurveda-green hover:bg-ayurveda-green/90"
        >
          <Plus size={18} className="mr-1" /> Add
        </Button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={generatePrescription}
          disabled={selectedTests.length === 0}
          className="flex-1"
        >
          <ClipboardCheck size={18} className="mr-2" /> Generate Prescription
        </Button>
        
        <Button
          onClick={mergeWithMeds}
          disabled={selectedTests.length === 0}
          variant="outline"
          className="flex-1"
        >
          <FilePlus2 size={18} className="mr-2" /> Merge with Medications
        </Button>
      </div>
    </div>
    <GeneratedPrescription
        isOpen={showGenerated}
        onClose={() => setShowGenerated(false)}
        patient={selectedPatient}
        medicines={[]}
        diagnosticTests={selectedTests}
        specialInstructions=""
        dietInstructions=""
        showPreview={false}
      />
    </>
  );
};

export default DiagnosticPrescriptionBuilder;
