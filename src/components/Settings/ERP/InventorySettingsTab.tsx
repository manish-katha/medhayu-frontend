
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Package, AlertTriangle, CalendarDays, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ErpSettings, erpSettingsSchema } from '@/types/settings';
import { getErpSettings, saveErpSettings } from '@/actions/settings.actions';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface InventorySettingsTabProps {
    setSubmitHandler: (handler: (() => Promise<void>) | null) => void;
}

const InventorySettingsTab: React.FC<InventorySettingsTabProps> = ({ setSubmitHandler }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);

    const form = useForm<ErpSettings>({
        resolver: zodResolver(erpSettingsSchema),
        defaultValues: {
            trackInventory: true,
            defaultLowStockThreshold: 10,
            expiryAlertDays: 30,
        }
    });

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
                    <CardTitle>Inventory Settings</CardTitle>
                    <CardDescription>Loading inventory configuration...</CardDescription>
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
                    <CardTitle className="flex items-center gap-2">
                        <Package size={18} />
                        Inventory Settings
                    </CardTitle>
                    <CardDescription>
                        Configure default behaviors for inventory management.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="trackInventory"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Inventory Tracking</FormLabel>
                                <FormDescription>
                                Automatically deduct stock on new invoices.
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="defaultLowStockThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><AlertTriangle size={16}/> Default Low Stock Threshold</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Set the default quantity to trigger a low stock alert.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expiryAlertDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><CalendarDays size={16}/> Expiry Alert Period (in days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Get notified this many days before a batch expires.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-4">Data Import / Export</h3>
                        <div className="flex gap-4">
                           <Button type="button" variant="outline">
                                <Upload className="mr-2 h-4 w-4" /> Import Inventory (CSV)
                            </Button>
                            <Button type="button" variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Export Inventory (CSV)
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Form>
    );
};

export default InventorySettingsTab;
