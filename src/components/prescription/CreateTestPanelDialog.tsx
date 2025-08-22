
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Autocomplete } from '@/components/ui/autocomplete';
import { masterDiagnosticTests } from '@/data/diagnosticTests';
import { Plus, Trash2, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export interface CustomPanelData {
  name: string;
  description: string;
  tests: string[];
}

interface CreateTestPanelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (panelData: CustomPanelData) => void;
}

const CreateTestPanelDialog: React.FC<CreateTestPanelDialogProps> = ({ isOpen, onClose, onCreate }) => {
  const { toast } = useToast();
  const [panelName, setPanelName] = useState('');
  const [panelDescription, setPanelDescription] = useState('');
  const [currentTest, setCurrentTest] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const handleSelectTest = (test: string) => {
    if (test && !selectedTests.includes(test)) {
      setSelectedTests(prev => [...prev, test]);
    }
    // Clear the input for the next test
    setCurrentTest('');
  };
  
  const removeTest = (testToRemove: string) => {
    setSelectedTests(prev => prev.filter(test => test !== testToRemove));
  };

  const handleCreate = () => {
    if (!panelName) {
      toast({ title: 'Panel name is required', variant: 'destructive' });
      return;
    }
    if (selectedTests.length === 0) {
      toast({ title: 'Please add at least one test', variant: 'destructive' });
      return;
    }

    onCreate({
      name: panelName,
      description: panelDescription,
      tests: selectedTests,
    });
    
    // Reset form
    setPanelName('');
    setPanelDescription('');
    setSelectedTests([]);
    setCurrentTest('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Custom Test Panel</DialogTitle>
          <DialogDescription>
            Group frequently used diagnostic tests into a reusable panel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="panel-name">Panel Name</Label>
            <Input
              id="panel-name"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="e.g., Post-Panchakarma Panel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-description">Description (Optional)</Label>
            <Textarea
              id="panel-description"
              value={panelDescription}
              onChange={(e) => setPanelDescription(e.target.value)}
              placeholder="Describe the purpose of this panel"
            />
          </div>
          <div className="space-y-2">
            <Label>Tests</Label>
            <div className="flex gap-2">
              <Autocomplete
                options={masterDiagnosticTests}
                value={currentTest}
                onValueChange={setCurrentTest}
                onSelect={handleSelectTest}
                placeholder="Search for a test to add..."
                className="flex-grow"
              />
            </div>
          </div>
          {selectedTests.length > 0 && (
            <ScrollArea className="h-40 border rounded-md p-2">
              <div className="space-y-2">
                {selectedTests.map((test) => (
                  <div key={test} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                    <span>{test}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTest(test)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
            Create Panel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestPanelDialog;
