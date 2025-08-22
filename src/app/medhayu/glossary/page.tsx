

'use client';

import { getGlossaryData } from "@/services/glossary.service";
import { CreateCategoryDialog, CreateTermDialog } from "@/components/admin/glossary-forms";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus, Upload } from "lucide-react";
import { GlossaryBrowser } from "@/components/admin/glossary-browser";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { GlossaryCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function GlossaryPage() {
    const [groupedTerms, setGroupedTerms] = useState<GlossaryCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getGlossaryData();
            setGroupedTerms(data);
        } catch (error) {
            toast({ title: 'Error fetching glossary data', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalTerms = groupedTerms.reduce((acc, group) => acc + group.terms.length, 0);

    return (
        <div className="medhayu-module-container space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Manage Glossary</h1>
                <div className="flex gap-2 flex-wrap">
                     <Link href="/medhayu/glossary/import" passHref>
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Import
                        </Button>
                    </Link>
                    <CreateCategoryDialog onCategoryCreated={fetchData}>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </CreateCategoryDialog>
                </div>
            </div>
            
            <GlossaryBrowser groupedTerms={groupedTerms} totalTerms={totalTerms} />

            <CreateTermDialog categories={groupedTerms} onTermCreated={fetchData}>
                <Button
                    size="icon"
                    className="fixed z-10 bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-primary text-primary-foreground"
                    aria-label="Create new term"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </CreateTermDialog>
        </div>
    )
}
