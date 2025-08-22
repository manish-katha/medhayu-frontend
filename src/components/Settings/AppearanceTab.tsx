
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { getPrescriptionSettings, savePrescriptionSettings } from '@/actions/settings.actions';
import { useToast } from '@/hooks/use-toast';
import { PrescriptionSettings, prescriptionSettingsSchema } from '@/types/prescription';

const colorSchemes = [
    {
        name: 'Ayurveda Green',
        primary: '105 20% 46%',
        accent: '35 56% 53%',
        previewClass: 'bg-ayurveda-green'
    },
    {
        name: 'Ayurveda Ochre',
        primary: '35 56% 53%',
        accent: '105 20% 46%',
        previewClass: 'bg-ayurveda-ochre'
    },
    {
        name: 'Terracotta',
        primary: '14 30% 52%',
        accent: '25 18% 30%',
        previewClass: 'bg-ayurveda-terracotta'
    },
    {
        name: 'Earth Brown',
        primary: '25 18% 30%',
        accent: '14 30% 52%',
        previewClass: 'bg-ayurveda-brown'
    }
];

interface DashboardLayoutSettings {
    showAppointments: boolean;
    showWeather: boolean;
    showCalendar: boolean;
    showStats: boolean;
}

const AppearanceTab = () => {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const [activeColorScheme, setActiveColorScheme] = useState(colorSchemes[0].name);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<PrescriptionSettings>({
        resolver: zodResolver(prescriptionSettingsSchema),
        defaultValues: {
            showLogo: true,
            showWatermark: true,
            showFooter: true,
        },
    });

    const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutSettings>({
        showAppointments: true,
        showWeather: true,
        showCalendar: true,
        showStats: true,
    });

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            try {
                const settings = await getPrescriptionSettings();
                form.reset(settings);
                
                const savedLayout = localStorage.getItem('dashboardLayout');
                if (savedLayout) {
                    setDashboardLayout(JSON.parse(savedLayout));
                }

                const savedSchemeName = localStorage.getItem('opdo-color-scheme') || colorSchemes[0].name;
                const scheme = colorSchemes.find(s => s.name === savedSchemeName) || colorSchemes[0];
                if (scheme) {
                  applyColorScheme(scheme, false); // Don't save to LS again
                }

            } catch (error) {
                toast({ title: "Failed to load settings", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [form, toast]);
    
    const applyColorScheme = (scheme: typeof colorSchemes[0], saveToLs = true) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', scheme.primary);
        root.style.setProperty('--accent', scheme.accent);
        setActiveColorScheme(scheme.name);
        if (saveToLs) {
            localStorage.setItem('opdo-color-scheme', scheme.name);
        }
    }

    const handleSettingChange = async (field: keyof PrescriptionSettings, value: boolean) => {
        const currentValues = form.getValues();
        const updatedValues = { ...currentValues, [field]: value };
        form.setValue(field, value);

        try {
            await savePrescriptionSettings(updatedValues);
            toast({
                title: "Setting Saved",
                description: "Your prescription design preference has been updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save setting.",
                variant: "destructive",
            });
            form.setValue(field, !value);
        }
    };
    
    const handleLayoutChange = (field: keyof DashboardLayoutSettings, value: boolean) => {
        setDashboardLayout(prev => {
            const newLayout = { ...prev, [field]: value };
            localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
            window.dispatchEvent(new Event('storage')); // Notify other components
            return newLayout;
        });
    };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Options</CardTitle>
          <CardDescription>Choose between light, dark, or system default themes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div 
                className={cn(
                    "border rounded-md p-4 cursor-pointer relative",
                    theme === 'light' && 'ring-2 ring-primary'
                )}
                onClick={() => setTheme('light')}
            >
              <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center text-black">
                Light Mode
              </div>
              <p className="text-sm text-center">Light</p>
              {theme === 'light' && <Check className="absolute top-2 right-2 h-5 w-5 text-primary" />}
            </div>
            <div 
                className={cn(
                    "border rounded-md p-4 cursor-pointer relative",
                    theme === 'dark' && 'ring-2 ring-primary'
                )}
                onClick={() => setTheme('dark')}
            >
              <div className="h-20 bg-gray-800 rounded mb-2 flex items-center justify-center text-white">
                Dark Mode
              </div>
              <p className="text-sm text-center">Dark</p>
              {theme === 'dark' && <Check className="absolute top-2 right-2 h-5 w-5 text-primary" />}
            </div>
             <div 
                className={cn(
                    "border rounded-md p-4 cursor-pointer relative",
                    theme === 'system' && 'ring-2 ring-primary'
                )}
                onClick={() => setTheme('system')}
             >
              <div className="h-20 bg-gradient-to-b from-white to-gray-900 rounded mb-2 flex items-center justify-center text-gray-700">
                Auto
              </div>
              <p className="text-sm text-center">System</p>
               {theme === 'system' && <Check className="absolute top-2 right-2 h-5 w-5 text-primary" />}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Select a primary color accent for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-4 gap-4">
            {colorSchemes.map((scheme) => (
                <div 
                    key={scheme.name}
                    className={cn(
                        "border rounded-md p-2 cursor-pointer relative",
                        activeColorScheme === scheme.name && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => applyColorScheme(scheme)}
                >
                    <div className={cn("h-10 rounded mb-2", scheme.previewClass)}></div>
                    <p className="text-xs text-center">{scheme.name}</p>
                    {activeColorScheme === scheme.name && <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />}
                </div>
            ))}
          </div>
           <p className="text-xs text-muted-foreground mt-2">Additional color schemes coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Prescription Design</CardTitle>
            <CardDescription>Customize elements on your printed prescriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                    <Label htmlFor="presciption-header-logo" className="flex-grow">Show clinic logo in header</Label>
                    <Switch id="presciption-header-logo" checked={form.watch('showLogo')} onCheckedChange={(val) => handleSettingChange('showLogo', val)} />
                    </div>
                    <div className="flex items-center justify-between">
                    <Label htmlFor="presciption-watermark" className="flex-grow">Apply watermark to prescriptions</Label>
                    <Switch id="presciption-watermark" checked={form.watch('showWatermark')} onCheckedChange={(val) => handleSettingChange('showWatermark', val)} />
                    </div>
                    <div className="flex items-center justify-between">
                    <Label htmlFor="presciption-footer" className="flex-grow">Include clinic details in footer</Label>
                    <Switch id="presciption-footer" checked={form.watch('showFooter')} onCheckedChange={(val) => handleSettingChange('showFooter', val)} />
                    </div>
                </>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Dashboard Layout</CardTitle>
            <CardDescription>Toggle visibility of widgets on your main dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard-appointments" className="flex-grow">Show appointments on dashboard</Label>
              <Switch id="dashboard-appointments" checked={dashboardLayout.showAppointments} onCheckedChange={(val) => handleLayoutChange('showAppointments', val)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard-weather" className="flex-grow">Show weather widget</Label>
               <Switch id="dashboard-weather" checked={dashboardLayout.showWeather} onCheckedChange={(val) => handleLayoutChange('showWeather', val)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard-calendar" className="flex-grow">Show Hindu calendar</Label>
              <Switch id="dashboard-calendar" checked={dashboardLayout.showCalendar} onCheckedChange={(val) => handleLayoutChange('showCalendar', val)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard-stats" className="flex-grow">Show clinic statistics</Label>
              <Switch id="dashboard-stats" checked={dashboardLayout.showStats} onCheckedChange={(val) => handleLayoutChange('showStats', val)} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceTab;
