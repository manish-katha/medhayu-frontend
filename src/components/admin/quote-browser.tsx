
'use client';

import React from 'react';
import type { Quote, QuoteCategory } from '@/types/quote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuoteBrowserProps {
  groupedQuotes: QuoteCategory[];
  totalQuotes: number;
}

function QuoteTable({ quotes }: { quotes: Quote[] }) {
    if (!quotes || quotes.length === 0) {
        return <p className="text-sm text-center text-muted-foreground p-4">No quotes in this category.</p>;
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Quote</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Source</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                        <TableCell className="italic">“{quote.quote}”</TableCell>
                        <TableCell className="font-medium">{quote.author}</TableCell>
                        <TableCell className="text-muted-foreground">{quote.source}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function QuoteBrowser({ groupedQuotes, totalQuotes }: QuoteBrowserProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Library</CardTitle>
        <CardDescription>
          Browse and manage your collection of {totalQuotes} quotes across {groupedQuotes.length} categories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={groupedQuotes[0]?.id || 'all'}>
          <TabsList>
            <TabsTrigger value="all">All Quotes</TabsTrigger>
            {groupedQuotes.map(category => (
                 <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {groupedQuotes.map(category => (
                <div key={category.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <QuoteTable quotes={category.quotes || []} />
                </div>
            ))}
          </TabsContent>
           {groupedQuotes.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-4">
                    <QuoteTable quotes={category.quotes || []} />
                </TabsContent>
           ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
