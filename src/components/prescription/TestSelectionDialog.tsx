
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Panel {
  id: string;
  name: string;
  description: string;
  tests: string[];
}

interface TestSelectionDialogProps {
  panel: Panel | null;
  onClose: () => void;
  onAddSelected: (selectedTests: string[]) => void;
}

const TestSelectionDialog: React.FC<TestSelectionDialogProps> = ({ panel, onClose, onAddSelected }) => {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Pre-select all tests when a new panel is opened
    if (panel) {
      setSelectedTests(panel.tests);
    } else {
      setSelectedTests([]);
    }
  }, [panel]);

  const handleTestToggle = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handleAddClick = () => {
    if (selectedTests.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to add.",
        variant: "destructive",
      });
      return;
    }
    
    onAddSelected(selectedTests);
    toast({
      title: "Tests Added",
      description: `${selectedTests.length} tests have been added to the prescription.`,
    });
    onClose();
  };

  if (!panel) return null;

  return (
    <Dialog open={!!panel} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Tests from: {panel.name}</DialogTitle>
          <DialogDescription>
            Choose the diagnostic tests you want to add to the prescription.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80 my-4">
          <div className="space-y-2 pr-6">
            {panel.tests.map((test, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                <Checkbox
                  id={`test-${index}`}
                  checked={selectedTests.includes(test)}
                  onCheckedChange={() => handleTestToggle(test)}
                />
                <Label htmlFor={`test-${index}`} className="flex-1 cursor-pointer">
                  {test}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddClick} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
            Add {selectedTests.length} Selected Test(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestSelectionDialog;
