
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Barcode, Plus, ListChecks, MessageCircle, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { getPatientIdSettings, savePatientIdSettings } from '@/actions/settings.actions';
import { useToast } from '@/hooks/use-toast';
import { PatientIdSettings, patientIdSettingsSchema } from '@/types/settings';

interface PatientDataTabProps {
    setSubmitHandler?: (handler: (() => Promise<void>) | null) => void;
}

const PatientDataTab: React.FC<PatientDataTabProps> = ({ setSubmitHandler }) => {
  const [whatsappBotEnabled, setWhatsappBotEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<PatientIdSettings>({
    resolver: zodResolver(patientIdSettingsSchema),
    defaultValues: {
        prefix: 'OPDO-',
        nextNumber: 1,
        suffix: '',
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getPatientIdSettings();
        form.reset(settings);
      } catch (error) {
        toast({ title: "Failed to load settings", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);

  const onSubmit = async (data: PatientIdSettings) => {
    const result = await savePatientIdSettings(data);
    if (result.success) {
      toast({ title: "Settings Saved", description: "Patient ID settings have been updated." });
      form.reset(data); // Re-sync form with saved data
    } else {
      toast({ title: "Error Saving Settings", description: result.error, variant: "destructive" });
    }
  };

  // Register the submit handler with the parent component
  useEffect(() => {
    if (setSubmitHandler) {
      setSubmitHandler(() => form.handleSubmit(onSubmit));
    }
    // Cleanup on unmount
    return () => {
        if (setSubmitHandler) {
            setSubmitHandler(null);
        }
    }
  }, [setSubmitHandler, form, onSubmit]);

  const exampleId = `${form.watch('prefix') || ''}${form.watch('nextNumber')}${form.watch('suffix') || ''}`;

  return (
    <div className="space-y-6">
      <Card className="md:col-span-3">
        <Form {...form}>
          {/* No form tag here, submission is handled by parent */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode size={18} />
                Patient Data Management
              </CardTitle>
              <CardDescription>
                Configure patient identification and data collection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Patient Identification Numbering</h3>
                    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="prefix"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>ID Prefix</Label>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nextNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Next Number</Label>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="suffix"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>ID Suffix</Label>
                                        <FormControl>
                                            <Input placeholder="Optional, e.g., /24-25" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The next patient registered will be assigned this number.
                        </p>
                        <div className="text-sm">
                            <span className="font-medium">Example ID:</span> {exampleId}
                        </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-4">Patient Registration Form</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure the information collected during patient registration
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Basic Information</Label>
                      <div className="pl-2 space-y-2 border-l-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="field-name" defaultChecked disabled />
                          <Label htmlFor="field-name">Full Name (Required)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-age" defaultChecked />
                          <Label htmlFor="field-age">Age</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-gender" defaultChecked />
                          <Label htmlFor="field-gender">Gender</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-dob" defaultChecked />
                          <Label htmlFor="field-dob">Date of Birth</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-marital" defaultChecked />
                          <Label htmlFor="field-marital">Marital Status</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-occupation" defaultChecked />
                          <Label htmlFor="field-occupation">Occupation</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Contact Information</Label>
                      <div className="pl-2 space-y-2 border-l-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="field-mobile" defaultChecked disabled />
                          <Label htmlFor="field-mobile">Mobile Number (Required)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-email" defaultChecked />
                          <Label htmlFor="field-email">Email Address</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-address" defaultChecked />
                          <Label htmlFor="field-address">Address</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="field-emergency" defaultChecked />
                          <Label htmlFor="field-emergency">Emergency Contact</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label className="text-base font-medium">Medical History</Label>
                    <div className="pl-2 space-y-2 border-l-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="field-chief-complaint" defaultChecked />
                        <Label htmlFor="field-chief-complaint">Chief Complaint</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="field-past-history" defaultChecked />
                        <Label htmlFor="field-past-history">Past Medical History</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="field-allergies" defaultChecked />
                        <Label htmlFor="field-allergies">Known Allergies</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="field-current-meds" defaultChecked />
                        <Label htmlFor="field-current-meds">Current Medications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="field-family-history" defaultChecked />
                        <Label htmlFor="field-family-history">Family History</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="field-lifestyle" defaultChecked />
                        <Label htmlFor="field-lifestyle">Lifestyle Information</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <Label htmlFor="add-custom-field" className="block font-medium">Custom Fields</Label>
                      <p className="text-sm text-muted-foreground">
                        Add additional fields to the registration form
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus size={16} className="mr-1" />
                      Add Custom Field
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <MessageCircle size={18} className="mr-2" />
                  WhatsApp Data Collection
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-whatsapp-bot" className="block font-medium">Enable WhatsApp Bot</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Collect patient information via WhatsApp conversations
                      </p>
                    </div>
                    <Switch 
                      id="enable-whatsapp-bot" 
                      checked={whatsappBotEnabled}
                      onCheckedChange={setWhatsappBotEnabled}
                    />
                  </div>
                  
                  {whatsappBotEnabled && (
                    <div className="space-y-4 pl-6 mt-2 pt-2 border-l">
                      <div className="space-y-2">
                        <Label htmlFor="bot-greeting">Bot Greeting Message</Label>
                        <Textarea 
                          id="bot-greeting" 
                          defaultValue="Hello! I'm the Oshadham Ayurveda virtual assistant. I'll help collect some information before your consultation. May I ask you a few questions?"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="question-interval">Question Interval</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger id="question-interval">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="short">Short pause (5s)</SelectItem>
                            <SelectItem value="medium">Medium pause (10s)</SelectItem>
                            <SelectItem value="long">Long pause (20s)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Time between asking questions
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="bot-confirmation" defaultChecked />
                        <Label htmlFor="bot-confirmation">Ask for confirmation before recording answers</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="bot-personal-info" defaultChecked />
                        <Label htmlFor="bot-personal-info">Get consent for personal information collection</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="bot-follow-up" defaultChecked />
                        <Label htmlFor="bot-follow-up">Enable follow-up reminders via WhatsApp</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bot-questionnaire">Questionnaire Management</Label>
                        <Button variant="outline" size="sm" className="w-full">
                          <ListChecks size={16} className="mr-1" />
                          Configure Bot Questionnaire
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Manage the questions your bot will ask patients
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
        </Form>
      </Card>
    </div>
  );
};

export default PatientDataTab;
