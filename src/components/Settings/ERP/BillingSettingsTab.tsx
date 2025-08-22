
'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Receipt, FileText, Banknote, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ErpSettings, erpSettingsSchema } from '@/types/settings';
import { getErpSettings, saveErpSettings } from '@/actions/settings.actions';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface BillingSettingsTabProps {
    setSubmitHandler: (handler: (() => Promise<void>) | null) => void;
}

const paymentMethods = [
    { id: 'Cash', label: 'Cash' },
    { id: 'Card', label: 'Credit/Debit Card' },
    { id: 'UPI', label: 'UPI' },
    { id: 'Bank Transfer', label: 'Bank Transfer' },
    { id: 'Cheque', label: 'Cheque' },
];

const currencies = [
    { value: 'INR', label: '₹ - Indian Rupee' },
    { value: 'USD', label: '$ - US Dollar' },
    { value: 'EUR', label: '€ - Euro' },
    { value: 'GBP', label: '£ - British Pound' },
    { value: 'JPY', label: '¥ - Japanese Yen' },
    { value: 'CNY', label: '¥ or 元 - Chinese Yuan' },
    { value: 'RUB', label: '₽ - Russian Ruble' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CAD', label: 'C$ - Canadian Dollar' },
    { value: 'AUD', label: 'A$ - Australian Dollar' },
    { value: 'SGD', label: 'S$ - Singapore Dollar' },
    { value: 'AED', label: 'د.إ - UAE Dirham' },
    { value: 'SAR', label: '﷼ - Saudi Riyal' },
    { value: 'KRW', label: '₩ - Korean Won' },
    { value: 'TRY', label: '₺ - Turkish Lira' },
    { value: 'THB', label: '฿ - Thai Baht' },
    { value: 'MYR', label: 'RM - Malaysian Ringgit' },
    { value: 'IDR', label: 'Rp - Indonesian Rupiah' },
    { value: 'ZAR', label: 'R - South African Rand' },
    { value: 'BRL', label: 'R$ - Brazilian Real' },
];

const BillingSettingsTab: React.FC<BillingSettingsTabProps> = ({ setSubmitHandler }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);

    const form = useForm<ErpSettings>({
        resolver: zodResolver(erpSettingsSchema),
        defaultValues: {
            currency: 'INR',
            defaultPaymentTerms: 'Due on receipt',
            invoiceFooter: 'Thank you for your business!',
            enabledPaymentMethods: ['Cash', 'Card', 'UPI'],
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
                    <CardTitle>Billing & Payments Settings</CardTitle>
                    <CardDescription>Loading billing configuration...</CardDescription>
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
                        <Receipt size={18} />
                        Billing & Payments
                    </CardTitle>
                    <CardDescription>
                        Set defaults for invoicing and accepted payment methods.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Landmark size={16}/> Default Currency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default currency" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {currencies.map(c => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                     <FormDescription>
                                        The default currency for all transactions.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="defaultPaymentTerms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><FileText size={16}/> Default Payment Terms</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Due on receipt" />
                                    </FormControl>
                                    <FormDescription>
                                        This will appear on new invoices by default.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="invoiceFooter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><FileText size={16}/> Invoice Footer Text</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="e.g., Thank you for your business!" />
                                    </FormControl>
                                    <FormDescription>
                                        A short note to appear at the bottom of invoices.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <FormField
                        control={form.control}
                        name="enabledPaymentMethods"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base flex items-center gap-2"><Banknote size={16}/> Enabled Payment Methods</FormLabel>
                                    <FormDescription>
                                    Select the payment methods you accept at your clinic.
                                    </FormDescription>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {paymentMethods.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="enabledPaymentMethods"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            (field.value || [])?.filter(
                                                            (value) => value !== item.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </Form>
    );
};

export default BillingSettingsTab;
