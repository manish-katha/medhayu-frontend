
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QuoteBrowser } from "@/components/admin/quote-browser";
import { CreateQuoteCategoryDialog, CreateQuoteDialog } from "@/components/admin/quote-forms";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus } from "lucide-react";
import { getQuoteData, QuoteCategory } from "@/services/quote.service";
import { useToast } from '@/hooks/use-toast';

interface QuotesPageClientProps {
    initialGroupedQuotes: QuoteCategory[];
    initialTotalQuotes: number;
}

export function QuotesPageClient({ initialGroupedQuotes, initialTotalQuotes }: QuotesPageClientProps) {
    const [groupedQuotes, setGroupedQuotes] = useState(initialGroupedQuotes);
    const [totalQuotes, setTotalQuotes] = useState(initialTotalQuotes);
    const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false);
    const { toast } = useToast();

    const refreshData = useCallback(async () => {
        try {
            const data = await getQuoteData();
            setGroupedQuotes(data);
            setTotalQuotes(data.reduce((acc, group) => acc + (group.quotes?.length || 0), 0));
        } catch (error) {
            toast({ title: 'Error fetching data', variant: 'destructive' });
        }
    }, [toast]);

    const handleQuoteCreated = () => {
        refreshData();
        setIsCreateQuoteOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Manage Quotes</h1>
                <div className="flex gap-2 flex-wrap">
                    <CreateQuoteCategoryDialog onCategoryCreated={refreshData}>
                         <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </CreateQuoteCategoryDialog>
                </div>
            </div>
            
            <QuoteBrowser groupedQuotes={groupedQuotes} totalQuotes={totalQuotes} />

            <CreateQuoteDialog 
                open={isCreateQuoteOpen} 
                onOpenChange={setIsCreateQuoteOpen} 
                categories={groupedQuotes} 
                onQuoteCreated={handleQuoteCreated} 
            />

            <Button
                size="icon"
                className="fixed z-10 bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-primary text-primary-foreground"
                aria-label="Create new quote"
                onClick={() => setIsCreateQuoteOpen(true)}
            >
                <Plus className="h-8 w-8" />
            </Button>
        </>
    )
}
