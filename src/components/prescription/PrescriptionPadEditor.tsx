
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Upload, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layout,
  FileText,
  Save,
  Barcode,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Type,
  Loader2,
  QrCode
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getPrescriptionSettings, savePrescriptionSettings } from '@/actions/settings.actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { PrescriptionSettings } from '@/types/prescription';
import { prescriptionSettingsSchema } from '@/types/prescription';
import { getClinicLogo } from '@/services/clinic.service';
import Image from 'next/image';

const PrescriptionPadEditor = () => {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [clinicLogo, setClinicLogo] = useState<string | null>(null);

    const form = useForm<PrescriptionSettings>({
        resolver: zodResolver(prescriptionSettingsSchema),
        defaultValues: {
            headerAlignment: 'center',
            showLogo: true,
            logoPlacement: 'center',
            showClinicName: true,
            showDoctorName: true,
            addressPlacement: 'header',
            contactPlacement: 'header',
            showAddress: true,
            showContact: true,
            headerBackground: '#f8f8f8',
            textColor: '#333333',
            accentColor: '#1e8a4c',
            fontFamily: 'Inter',
            showFooter: true,
            footerText: 'Thank you for visiting Oshadham Ayurveda. Follow the prescription as directed.',
            showWatermark: true,
            watermarkOpacity: 5,
            headerBorderStyle: 'solid',
            bodyBackground: '#ffffff',
            showSignature: true,
            signaturePlacement: 'right',
            useLetterhead: false,
            enableBarcode: false,
        }
    });

    const prescriptionPreview = form.watch();

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [settings, logo] = await Promise.all([
                    getPrescriptionSettings(),
                    getClinicLogo()
                ]);

                if (settings) {
                    form.reset(settings);
                }
                if (logo) {
                    setClinicLogo(logo);
                }
            } catch (error) {
                toast({ title: 'Failed to load settings', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [form, toast]);

    const onSubmit = async (data: PrescriptionSettings) => {
        setIsSaving(true);
        try {
            await savePrescriptionSettings(data);
            toast({ title: 'Settings Saved', description: 'Your prescription design has been updated.' });
        } catch (error) {
            toast({ title: 'Failed to save settings', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="layout">
        <TabsList className="grid grid-cols-5 max-w-2xl mb-6">
          <TabsTrigger value="layout">
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="header">
            <Type className="w-4 h-4 mr-2" />
            Header
          </TabsTrigger>
          <TabsTrigger value="body">
            <FileText className="w-4 h-4 mr-2" />
            Body
          </TabsTrigger>
          <TabsTrigger value="footer">
            <AlignCenter className="w-4 h-4 mr-2" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6 md:col-span-1">
            <TabsContent value="layout" className="space-y-4 mt-0">
               <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="use-letterhead" className="font-medium text-amber-800">I have a letterhead</Label>
                  <Switch
                    id="use-letterhead"
                    checked={form.watch('useLetterhead')}
                    onCheckedChange={(checked) => form.setValue('useLetterhead', checked)}
                  />
                </div>
                {form.watch('useLetterhead') && (
                  <p className="text-sm text-amber-700">Letterhead mode will hide header/footer elements.</p>
                )}
              </Card>

              {/* Information Placement */}
              <div className="space-y-2">
                <Label>Information Placement</Label>
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="space-y-2">
                    <Label className="text-sm">Address Placement</Label>
                    <Select
                      value={form.watch('addressPlacement')}
                      onValueChange={(value) => form.setValue('addressPlacement', value as 'header' | 'footer')}
                      disabled={form.watch('useLetterhead')}
                    >
                      <SelectTrigger><SelectValue placeholder="Select placement" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Contact Placement</Label>
                    <Select
                      value={form.watch('contactPlacement')}
                      onValueChange={(value) => form.setValue('contactPlacement', value as 'header' | 'footer')}
                      disabled={form.watch('useLetterhead')}
                    >
                      <SelectTrigger><SelectValue placeholder="Select placement" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Paper Size</Label>
                <Select defaultValue="a4">
                  <SelectTrigger><SelectValue placeholder="Select paper size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                    <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </TabsContent>

            <TabsContent value="header" className="space-y-4 mt-0">
               {!form.watch('useLetterhead') ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo">Show Logo</Label>
                    <Switch
                      id="show-logo"
                      checked={form.watch('showLogo')}
                      onCheckedChange={(v) => form.setValue('showLogo', v)}
                    />
                  </div>
                  {form.watch('showLogo') && (
                    <div className="space-y-2 pl-6 border-l-2 border-gray-200">
                        <Label>Logo Placement</Label>
                         <RadioGroup
                            value={form.watch('logoPlacement')}
                            onValueChange={(v) => form.setValue('logoPlacement', v as 'left'|'center'|'right')}
                         >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="left" id="logo-left" /><Label htmlFor="logo-left">Left</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="center" id="logo-center" /><Label htmlFor="logo-center">Center</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="right" id="logo-right" /><Label htmlFor="logo-right">Right</Label></div>
                        </RadioGroup>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between"><Label htmlFor="show-clinic-name">Show Clinic Name</Label><Switch id="show-clinic-name" checked={form.watch('showClinicName')} onCheckedChange={(v) => form.setValue('showClinicName', v)} /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="show-doctor-name">Show Doctor Name</Label><Switch id="show-doctor-name" checked={form.watch('showDoctorName')} onCheckedChange={(v) => form.setValue('showDoctorName', v)} /></div>
                  <Separator />
                   <div className="space-y-2">
                        <Label>Header Alignment</Label>
                        <ToggleGroup type="single" value={form.watch('headerAlignment')} onValueChange={(v) => v && form.setValue('headerAlignment', v as 'left'|'center'|'right')} className="grid grid-cols-3">
                            <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
                            <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
                            <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
                        </ToggleGroup>
                   </div>
                   <div className="space-y-2">
                        <Label>Header Background Color</Label>
                        <Input type="color" {...form.register('headerBackground')} className="h-10 w-full" />
                   </div>
                </>
              ) : (
                <div className="text-center p-4 bg-muted rounded-md text-sm text-muted-foreground">
                  Header options disabled in Letterhead mode.
                </div>
              )}
            </TabsContent>

            <TabsContent value="body" className="space-y-4 mt-0">
                 <div className="space-y-2">
                    <Label>Main Accent Color</Label>
                    <Input 
                      type="color" 
                      {...form.register('accentColor')}
                      className="h-10 w-full"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Body Text Color</Label>
                    <Input 
                      type="color" 
                      {...form.register('textColor')}
                      className="h-10 w-full"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Body Background Color</Label>
                    <Input 
                      type="color" 
                      {...form.register('bodyBackground')}
                      className="h-10 w-full"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={form.watch('fontFamily')} onValueChange={(v) => form.setValue('fontFamily', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                            <SelectItem value="Roboto">Roboto (Sans-serif)</SelectItem>
                            <SelectItem value="Literata">Literata (Serif)</SelectItem>
                            <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </TabsContent>

            <TabsContent value="footer" className="space-y-4 mt-0">
                 {!form.watch('useLetterhead') ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-footer">Show Footer</Label>
                    <Switch
                      id="show-footer"
                      checked={form.watch('showFooter')}
                      onCheckedChange={(v) => form.setValue('showFooter', v)}
                    />
                  </div>
                  {form.watch('showFooter') && (
                    <div className="space-y-2 pl-6 border-l-2 border-gray-200">
                        <Label>Footer Text</Label>
                        <Textarea {...form.register('footerText')} rows={3} />
                    </div>
                  )}
                  <Separator />
                   <div className="flex items-center justify-between">
                    <Label htmlFor="show-signature">Show Signature</Label>
                    <Switch
                      id="show-signature"
                      checked={form.watch('showSignature')}
                      onCheckedChange={(v) => form.setValue('showSignature', v)}
                    />
                  </div>
                   {form.watch('showSignature') && (
                    <div className="space-y-2 pl-6 border-l-2 border-gray-200">
                        <Label>Signature Placement</Label>
                         <RadioGroup
                            value={form.watch('signaturePlacement')}
                            onValueChange={(v) => form.setValue('signaturePlacement', v as 'left'|'center'|'right')}
                         >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="left" id="sig-left" /><Label htmlFor="sig-left">Left</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="center" id="sig-center" /><Label htmlFor="sig-center">Center</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="right" id="sig-right" /><Label htmlFor="sig-right">Right</Label></div>
                        </RadioGroup>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-muted rounded-md text-sm text-muted-foreground">
                  Footer options disabled in Letterhead mode.
                </div>
              )}
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-0">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="show-watermark">Show Watermark</Label>
                    <Switch
                        id="show-watermark"
                        checked={form.watch('showWatermark')}
                        onCheckedChange={(v) => form.setValue('showWatermark', v)}
                    />
                 </div>
                 {form.watch('showWatermark') && (
                    <div className="space-y-2 pl-6 border-l-2 border-gray-200">
                        <Label>Watermark Opacity ({form.watch('watermarkOpacity')}%)</Label>
                        <Slider
                            min={1} max={20} step={1}
                            value={[form.watch('watermarkOpacity')]}
                            onValueChange={(v) => form.setValue('watermarkOpacity', v[0])}
                        />
                    </div>
                 )}
                 <Separator/>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="enable-barcode">Enable QR Code</Label>
                    <Switch
                        id="enable-barcode"
                        checked={form.watch('enableBarcode')}
                        onCheckedChange={(v) => form.setValue('enableBarcode', v)}
                    />
                 </div>
                 <p className="text-xs text-muted-foreground">Generates a unique QR code for prescription verification.</p>
            </TabsContent>
          </div>

          {/* Live Preview Panel */}
          <div className="md:col-span-2 bg-white border rounded-lg shadow p-4 relative">
            <div className="absolute top-2 right-2 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
              Live Preview
            </div>
            
            <div 
              className="mx-auto border rounded-md bg-white shadow-sm" 
              style={{ 
                maxWidth: '800px',
                minHeight: '1000px',
                backgroundColor: prescriptionPreview.bodyBackground
              }}
            >
              {!prescriptionPreview.useLetterhead && (
                <div 
                  className={cn('p-6 border-b', `border-${prescriptionPreview.headerBorderStyle}`)}
                  style={{ 
                    backgroundColor: prescriptionPreview.headerBackground,
                    textAlign: prescriptionPreview.headerAlignment as any
                  }}
                >
                  {prescriptionPreview.showLogo && (
                    <div 
                      className={cn('flex items-center mb-4', 
                        prescriptionPreview.logoPlacement === 'left' ? 'justify-start' : 
                        prescriptionPreview.logoPlacement === 'right' ? 'justify-end' : 
                        'justify-center'
                      )}
                    >
                      {clinicLogo ? (
                        <Image src={clinicLogo} alt="Clinic Logo" width={64} height={64} className="h-16 w-16 object-contain" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <ImageIcon size={32} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {prescriptionPreview.showClinicName && (
                    <h1 className="text-2xl font-bold" style={{ color: prescriptionPreview.accentColor, fontFamily: prescriptionPreview.fontFamily }}>
                        Oshadham Ayurveda Clinic
                    </h1>
                  )}
                   {prescriptionPreview.showDoctorName && (
                    <p className="text-lg font-medium mt-1" style={{ color: prescriptionPreview.textColor, fontFamily: prescriptionPreview.fontFamily }}>
                        Dr. Acharya Sharma
                    </p>
                  )}
                  {prescriptionPreview.addressPlacement === 'header' && prescriptionPreview.showAddress && (
                    <p className="text-sm mt-2" style={{ color: prescriptionPreview.textColor, fontFamily: prescriptionPreview.fontFamily }}>
                      123 Healing Path, Ayurveda Nagar, Bangalore - 560001
                    </p>
                  )}
                  {prescriptionPreview.contactPlacement === 'header' && prescriptionPreview.showContact && (
                    <p className="text-sm mt-1" style={{ color: prescriptionPreview.textColor, fontFamily: prescriptionPreview.fontFamily }}>
                      +91 98765 43210 | info@oshadham.com | www.oshadham.com
                    </p>
                  )}
                </div>
              )}
              
              {prescriptionPreview.useLetterhead && (
                <div className="p-6 border-b border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <p className="text-gray-400 italic">Pre-printed letterhead area</p>
                </div>
              )}
              
              <div className="p-6" style={{ fontFamily: prescriptionPreview.fontFamily, color: prescriptionPreview.textColor }}>
                <div className="flex flex-wrap border-b pb-4 mb-4">
                  <div className="w-1/2">
                    <p className="text-sm"><span className="font-medium">Patient:</span> Rajesh Kumar</p>
                  </div>
                  <div className="w-1/2 text-right">
                    <p className="text-sm"><span className="font-medium">Date:</span> 05 May, 2023</p>
                  </div>
                </div>
                 <div className="mb-6">
                    <h3 className="font-medium underline" style={{ color: prescriptionPreview.accentColor }}>MEDICINES</h3>
                 </div>
              </div>
              
              <div className="mt-auto p-6" style={{fontFamily: prescriptionPreview.fontFamily}}>
                <div className="flex justify-between items-end">
                    {prescriptionPreview.enableBarcode && (
                        <div>
                            <QrCode size={64}/>
                        </div>
                    )}
                    {prescriptionPreview.showSignature && (
                         <div className={cn("text-center", 
                            prescriptionPreview.signaturePlacement === 'left' ? 'text-left' :
                            prescriptionPreview.signaturePlacement === 'right' ? 'text-right' :
                            'text-center'
                         )}>
                            <div className="w-48 h-16 border-b inline-block mb-1"></div>
                            <p className="text-sm">(Dr. Acharya Sharma)</p>
                        </div>
                    )}
                </div>
              </div>


              {!prescriptionPreview.useLetterhead && prescriptionPreview.showFooter && (
                <div className="p-4 border-t text-center text-sm" style={{ fontFamily: prescriptionPreview.fontFamily }}>
                  {prescriptionPreview.footerText}
                   {prescriptionPreview.addressPlacement === 'footer' && prescriptionPreview.showAddress && (
                    <p className="mt-2">123 Healing Path, Ayurveda Nagar, Bangalore - 560001</p>
                  )}
                  {prescriptionPreview.contactPlacement === 'footer' && prescriptionPreview.showContact && (
                    <p className="mt-1">+91 98765 43210 | info@oshadham.com</p>
                  )}
                </div>
              )}
              
              {prescriptionPreview.showWatermark && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ opacity: prescriptionPreview.watermarkOpacity / 100, zIndex: 10 }}>
                  <div className="transform -rotate-45 text-5xl font-bold text-gray-300">Oshadham Ayurveda</div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-4 space-x-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save size={16} className="mr-2"/>Save Design</>}
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </form>
  );
};

export default PrescriptionPadEditor;


    