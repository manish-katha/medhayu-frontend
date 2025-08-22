
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getClinicLogo, saveClinicLogo } from '@/services/clinic.service';
import { useToast } from '@/hooks/use-toast';

type LogoShape = 'square' | 'rectangle' | 'sleek' | 'round';

const ClinicDetailsTab = () => {
  const [logoShape, setLogoShape] = useState<LogoShape>('rectangle');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadLogo() {
      const savedLogo = await getClinicLogo();
      if (savedLogo) {
        setLogoPreview(savedLogo);
      }
    }
    loadLogo();
  }, []);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setLogoPreview(dataUrl);
        try {
          await saveClinicLogo(dataUrl);
          toast({ title: 'Logo updated successfully!' });
        } catch (error) {
          toast({ title: 'Failed to save logo', variant: 'destructive' });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={18} />
              Clinic Details
            </CardTitle>
            <CardDescription>
              Information about your Ayurvedic practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input id="clinicName" defaultValue="Oshadham Ayurveda Clinic" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={3} defaultValue="123 Healing Path, Ayurveda Nagar, Bangalore - 560001, Karnataka, India" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">Clinic Phone</Label>
                <Input id="clinicPhone" defaultValue="+91 80 2345 6789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Clinic Email</Label>
                <Input id="clinicEmail" type="email" defaultValue="info@oshadham.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" defaultValue="https://www.oshadham.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" defaultValue="AYUSH-KA-12345" />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Clinic Logo</CardTitle>
                <CardDescription>Upload and style your logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div 
                    className={cn(
                        "mx-auto border-2 border-dashed rounded-md flex items-center justify-center transition-all bg-muted/30 overflow-hidden",
                        logoShape === 'square' && 'w-32 h-32',
                        logoShape === 'rectangle' && 'w-40 h-28',
                        logoShape === 'sleek' && 'w-48 h-20',
                        logoShape === 'round' && 'w-32 h-32 rounded-full'
                    )}
                >
                    {logoPreview ? (
                        <Image src={logoPreview} alt="Clinic Logo" width={192} height={192} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center text-muted-foreground p-2">
                            <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                            <p className="text-xs">Logo Preview</p>
                        </div>
                    )}
                </div>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/svg+xml"
                />
                <Button variant="outline" className="w-full" onClick={handleLogoUploadClick}>Upload Logo</Button>
                <div>
                    <Label className="text-sm font-medium">Logo Shape</Label>
                    <RadioGroup 
                        value={logoShape}
                        onValueChange={(value: LogoShape) => setLogoShape(value)}
                        className="mt-2"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="square" id="square" />
                                <Label htmlFor="square">Square</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rectangle" id="rectangle" />
                                <Label htmlFor="rectangle">Rectangle</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sleek" id="sleek" />
                                <Label htmlFor="sleek">Sleek</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="round" id="round" />
                                <Label htmlFor="round">Round</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Operation Hours</CardTitle>
              <CardDescription>
                Your clinic's working hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <div key={day} className="flex justify-between items-center">
                    <Label>{day}</Label>
                    <div className="flex items-center space-x-2">
                      <Input className="w-20" defaultValue="09:00" />
                      <span>to</span>
                      <Input className="w-20" defaultValue="18:00" />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center">
                  <Label>Sunday</Label>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="closed">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetailsTab;
