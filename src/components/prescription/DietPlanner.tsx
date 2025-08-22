
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FilePlus2, Leaf, Plus, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { suggestDietPlan } from '@/ai/flows/diet-ai-assistant';
import BotLoading from '../ui/bot-loading';

export interface DietTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface DietPlannerProps {
  onApplyDiet: (dietPlan: string) => void;
  dietTemplates: DietTemplate[];
  setDietTemplates: React.Dispatch<React.SetStateAction<DietTemplate[]>>;
  onMerge: () => void;
}

const DietPlanner: React.FC<DietPlannerProps> = ({ onApplyDiet, dietTemplates, setDietTemplates, onMerge }) => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApplyTemplate = (template: DietTemplate) => {
    onApplyDiet(template.content);
    toast({
      title: 'Diet Plan Applied',
      description: `The "${template.name}" diet has been added to the prescription.`,
    });
    onMerge(); // This will switch the tab back to the builder
  };

  const handleGenerateDietTemplate = async () => {
    if (!newTemplateName) {
      toast({
        title: 'Template name required',
        description: 'Please enter a name for the diet template to generate content.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await suggestDietPlan({
        patientType: newTemplateName, // Using the template name as the main context
        prescription: newTemplateDescription || 'General diet plan',
      });
      setNewTemplateContent(result.dietPlan);
      toast({
        title: 'Diet plan generated',
        description: 'AI has generated a diet plan based on the template name.',
      });
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate AI diet plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCreateTemplate = () => {
    if (!newTemplateName || !newTemplateContent) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and content for the new template.',
        variant: 'destructive',
      });
      return;
    }

    const newTemplate: DietTemplate = {
      id: `dt-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDescription,
      content: newTemplateContent,
    };

    setDietTemplates(prev => [...prev, newTemplate]);
    setIsCreateDialogOpen(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateContent('');
    toast({
      title: 'Diet Template Created',
      description: `"${newTemplateName}" has been saved successfully.`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Diet Plan Templates</CardTitle>
              <CardDescription>Select a pre-made diet template or create a new one.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Diet Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf size={18} />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm text-muted-foreground max-h-24 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(template.content) }}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleApplyTemplate(template)} 
                    className="w-full bg-ayurveda-green hover:bg-ayurveda-green/90"
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Apply to Prescription
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Diet Template</DialogTitle>
            <DialogDescription>
              Build a reusable diet plan with food recommendations and lifestyle advice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Post-Panchakarma Diet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Input
                id="template-description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="A short description of the template's purpose"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="template-content">Diet Content</Label>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateDietTemplate} 
                    disabled={isGenerating}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
              {isGenerating ? (
                <div className="h-32 flex items-center justify-center">
                    <BotLoading text="Generating diet plan..."/>
                </div>
              ) : (
                <Textarea
                  id="template-content"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  placeholder="Enter diet recommendations. Use Markdown for formatting (e.g., **bold**, - lists)."
                  rows={10}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple markdown to HTML converter
const markdownToHtml = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')         // Italic
    .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>') // Unordered list
    .replace(/<\/ul>\n<ul>/gm, '') // Merge consecutive lists
    .replace(/\n/g, '<br />'); // Newlines
};

export default DietPlanner;
