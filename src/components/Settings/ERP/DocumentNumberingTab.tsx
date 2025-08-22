
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ErpSettings, erpSettingsSchema } from '@/types/settings';
import { getErpSettings, saveErpSettings } from '@/actions/settings.actions';

interface DocumentNumberingTabProps {
    setSubmitHandler: (handler: (() => Promise<void>) | null) => void;
}

const DocumentNumberingTab: React.FC<DocumentNumberingTabProps> = ({ setSubmitHandler }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<ErpSettings>({
    resolver: zodResolver(erpSettingsSchema),
    defaultValues: {
      autoNumbering: true,
      clinicName: 'OSH',
      doctorName: 'DOC',
      invoiceFormat: { prefix: 'INV-', nextNumber: 1, suffix: '' },
      poFormat: { prefix: 'PO-', nextNumber: 1, suffix: '' },
      returnFormat: { prefix: 'SALRE-', nextNumber: 1, suffix: '' },
    }
  });

  const autoNumbering = form.watch('autoNumbering');

  React.useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getErpSettings();
        form.reset(settings);
      } catch (error) {
        toast({ title: "Failed to load ERP settings", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);

  const onSubmit = async (data: ErpSettings) => {
    const result = await saveErpSettings(data);
    if (result.success) {
      toast({ title: "Settings Saved", description: "ERP settings have been updated." });
      form.reset(data);
    } else {
      toast({ title: "Error Saving Settings", description: JSON.stringify(result.error), variant: "destructive" });
    }
  };
  
  React.useEffect(() => {
    setSubmitHandler(() => form.handleSubmit(onSubmit));
    return () => setSubmitHandler(null);
  }, [setSubmitHandler, form, onSubmit]);


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ERP Settings</CardTitle>
          <CardDescription>Loading ERP configuration...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
        <Card>
          <CardHeader>
            <CardTitle>ERP Document Numbering</CardTitle>
            <CardDescription>
              Configure how Invoices, Purchase Orders, and Sales Returns are numbered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="autoNumbering"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Auto-Numbering</FormLabel>
                    <FormDescription>
                      Use the format: Clinic/YYMM-Number-Doctor (e.g., OSH/2407-00001-SHAR)
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
            
            {autoNumbering ? (
              <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name Abbreviation (3 letters)</FormLabel>
                      <FormControl><Input {...field} maxLength={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name Suffix (4 letters)</FormLabel>
                      <FormControl><Input {...field} maxLength={4} /></FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Invoice Number Format</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="invoiceFormat.prefix" render={({field}) => (<FormItem><FormLabel>Prefix</FormLabel><FormControl><Input {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="invoiceFormat.nextNumber" render={({field}) => (<FormItem><FormLabel>Next Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="invoiceFormat.suffix" render={({field}) => (<FormItem><FormLabel>Suffix</FormLabel><FormControl><Input {...field} maxLength={5} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
                <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Purchase Order Number Format</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="poFormat.prefix" render={({field}) => (<FormItem><FormLabel>Prefix</FormLabel><FormControl><Input {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="poFormat.nextNumber" render={({field}) => (<FormItem><FormLabel>Next Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="poFormat.suffix" render={({field}) => (<FormItem><FormLabel>Suffix</FormLabel><FormControl><Input {...field} maxLength={5} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
                <div className="p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Sales Return Number Format</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="returnFormat.prefix" render={({field}) => (<FormItem><FormLabel>Prefix</FormLabel><FormControl><Input {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="returnFormat.nextNumber" render={({field}) => (<FormItem><FormLabel>Next Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="returnFormat.suffix" render={({field}) => (<FormItem><FormLabel>Suffix</FormLabel><FormControl><Input {...field} maxLength={5} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </Form>
  );
};

export default DocumentNumberingTab;
