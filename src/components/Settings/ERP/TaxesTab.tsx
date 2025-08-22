
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ErpSettings, erpSettingsSchema } from '@/types/settings';
import { getErpSettings, saveErpSettings } from '@/actions/settings.actions';

interface TaxesTabProps {
    setSubmitHandler: (handler: (() => Promise<void>) | null) => void;
}

const TaxesTab: React.FC<TaxesTabProps> = ({ setSubmitHandler }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);

    // We extend the form to handle tax slabs, which might not be directly on the ErpSettings type yet
    const form = useForm<{ taxSlabs: { name: string; rate: number }[] }>({
        defaultValues: {
            taxSlabs: [
                { name: 'Standard GST', rate: 18 },
                { name: 'Reduced GST', rate: 12 },
                { name: 'Low GST', rate: 5 },
                { name: 'Exempt', rate: 0 },
            ]
        }
    });

    const { control, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "taxSlabs",
    });

    // This is a placeholder for form submission. 
    // In a real scenario, this would save to a different part of the settings.
    const onSubmit = async (data: { taxSlabs: { name: string; rate: number }[] }) => {
        toast({ title: "Tax Settings Saved", description: "Your tax configurations have been updated." });
        console.log(data);
    };

    // This component doesn't actually save anything yet, so we pass a placeholder.
    React.useEffect(() => {
        setSubmitHandler(() => Promise.resolve());
    }, [setSubmitHandler]);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Percent size={18} />
                           Tax Configuration
                        </CardTitle>
                        <CardDescription>
                            Manage GST tax slabs for your products and services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2">
                                <FormField
                                    control={control}
                                    name={`taxSlabs.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-grow">
                                            <FormLabel>Slab Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g., Standard GST" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={control}
                                    name={`taxSlabs.${index}.rate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="e.g., 18" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    disabled={fields.length <= 1}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ name: '', rate: 0 })}
                        >
                            <Plus size={16} className="mr-2" />
                            Add New Tax Slab
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
};

export default TaxesTab;
