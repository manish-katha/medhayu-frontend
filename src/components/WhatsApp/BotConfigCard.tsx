
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, SaveIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BotConfigProps {
  onSave: (config: { greeting: string; useAyurvedicForm: boolean; }) => void;
  initialConfig: { greeting: string; useAyurvedicForm: boolean; };
}

const BotConfigCard = ({ onSave, initialConfig }: BotConfigProps) => {
  const [useAyurvedicForm, setUseAyurvedicForm] = useState(initialConfig.useAyurvedicForm);
  const [greeting, setGreeting] = useState(initialConfig.greeting);

  const handleSave = () => {
    onSave({ greeting, useAyurvedicForm });
  };
  
  return (
    <Card>
      <CardHeader className="bg-ayurveda-green/5 border-b">
        <CardTitle className="text-ayurveda-green">Bot Configuration</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Tabs defaultValue="greeting">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="greeting">Basic Settings</TabsTrigger>
            <TabsTrigger value="questions">Intake Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="greeting" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="greeting">Bot Greeting Message</Label>
              <Textarea 
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This is the first message patients will receive when they message your clinic
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-4 pt-4">
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Use Ayurvedic Research Form Questions</h4>
                  <p className="text-xs text-muted-foreground">
                    Toggle to use comprehensive questions from the Ayurvedic Medical History Research Form
                  </p>
                </div>
                <Switch 
                  checked={useAyurvedicForm}
                  onCheckedChange={setUseAyurvedicForm}
                />
              </div>
            </div>
            
            {useAyurvedicForm ? (
              <div className="space-y-4">
                <h4 className="font-medium">Select Form Sections to Include</h4>
                
                {[
                  { id: 'general', title: 'General Information', enabled: true },
                  { id: 'roga', title: 'Roga Rogi Pariksha', enabled: true },
                  { id: 'kayachikitsa', title: 'Kayachikitsa', enabled: true },
                  { id: 'lifestyle', title: 'Lifestyle and Goals', enabled: true },
                ].map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <div>
                      <h5 className="text-sm font-medium">{section.title}</h5>
                      <p className="text-xs text-muted-foreground">Include questions from this section</p>
                    </div>
                    <Switch defaultChecked={section.enabled} />
                  </div>
                ))}
                
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Form Field Preview</h4>
                  <div className="p-3 border rounded-md bg-background/50 max-h-64 overflow-y-auto">
                    <h5 className="text-sm font-semibold mb-2">Sample Fields from Ayurvedic Research Form:</h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2">1</span>
                        <span>What is your full name?</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2">2</span>
                        <span>What is your date of birth?</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2">3</span>
                        <span>What is your primary complaint?</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2">4</span>
                        <span>Duration of condition?</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2">5</span>
                        <span>Dosha predominance (Vata/Pitta/Kapha)?</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      The WhatsApp bot will automatically convert these fields into a conversational format when collecting data from patients.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Custom Intake Questions</h4>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    <PlusCircle size={14} className="mr-1" /> Add Question
                  </Button>
                </div>
                
                {[
                  {id: 1, question: "What is your full name?", required: true},
                  {id: 2, question: "What is your age?", required: true},
                  {id: 3, question: "What is your phone number?", required: true},
                  {id: 4, question: "What is your chief complaint?", required: true},
                  {id: 5, question: "Duration of the problem?", required: false},
                ].map((item, idx) => (
                  <div key={item.id} className="p-3 border rounded-md bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="bg-muted w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {idx + 1}
                        </span>
                        <Label className="text-sm font-medium">Question {idx + 1}</Label>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${item.required ? 'bg-ayurveda-ochre/20 text-ayurveda-ochre' : 'bg-muted text-muted-foreground'}`}>
                        {item.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <Input 
                      defaultValue={item.question} 
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </TabsContent>
        </Tabs>

        <Button 
          className="w-full mt-4 bg-ayurveda-green hover:bg-ayurveda-green/90"
          onClick={handleSave}
        >
          <SaveIcon size={16} className="mr-2" />
          Save Bot Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default BotConfigCard;
