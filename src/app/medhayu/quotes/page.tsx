
import React from 'react';
import { getQuoteData } from "@/services/quote.service";
import { QuotesPageClient } from './QuotesPageClient';

export default async function QuotesPage() {
    const groupedQuotes = await getQuoteData();
    const totalQuotes = groupedQuotes.reduce((acc, group) => acc + (group.quotes?.length || 0), 0);

    // Pass server-fetched data to the client component
    return (
        <div className="medhayu-module-container space-y-8">
            <QuotesPageClient
                initialGroupedQuotes={groupedQuotes}
                initialTotalQuotes={totalQuotes}
            />
        </div>
    );
}
