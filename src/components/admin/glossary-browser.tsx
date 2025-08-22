
'use client';

import React, { useState, useMemo } from 'react';
import type { GlossaryCategory, GlossaryTerm } from '@/types/glossary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Globe, Folder, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTermDialog, CreateCategoryDialog } from './glossary-forms';
import { ScrollArea } from '../ui/scroll-area';

interface GlossaryBrowserProps {
  groupedTerms: GlossaryCategory[];
  totalTerms: number;
}

function TermTable({ terms }: { terms: GlossaryTerm[] }) {
  if (terms.length === 0) {
    return <p className="text-sm text-center text-muted-foreground p-4">No terms in this category.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Term</TableHead>
          <TableHead>Aliases</TableHead>
          <TableHead>Definition</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {terms.map((term, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{term.term}</TableCell>
            <TableCell className="text-muted-foreground">{term.aliases?.join(', ')}</TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-sm truncate">{term.definition}</TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 size={14} /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function GlossaryBrowser({ groupedTerms, totalTerms }: GlossaryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return groupedTerms;
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return groupedTerms.map(category => {
      const filteredTerms = category.terms.filter(term => 
        term.term.toLowerCase().includes(lowercasedQuery) ||
        (term.aliases && term.aliases.some(alias => alias.toLowerCase().includes(lowercasedQuery))) ||
        term.definition.toLowerCase().includes(lowercasedQuery)
      );
      return { ...category, terms: filteredTerms };
    }).filter(category => category.terms.length > 0);
  }, [groupedTerms, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Glossary Library</CardTitle>
        <CardDescription>
          Browse and manage your collection of {totalTerms} terms across {groupedTerms.length} categories.
        </CardDescription>
        <div className="relative pt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search all terms..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={filteredData[0]?.id || 'all'}>
          <TabsList>
            <TabsTrigger value="all">All Terms</TabsTrigger>
            {groupedTerms.map(category => (
                 <TabsTrigger key={category.id} value={category.id}>
                    {category.scope === 'global' ? <Globe className="h-4 w-4 mr-2"/> : <Folder className="h-4 w-4 mr-2"/>}
                    {category.name}
                </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="all">
                {filteredData.map(category => (
                    <div key={category.id} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                        <TermTable terms={category.terms} />
                    </div>
                ))}
            </TabsContent>
            {groupedTerms.map(category => (
                 <TabsContent key={category.id} value={category.id}>
                    <TermTable terms={category.terms} />
                 </TabsContent>
            ))}
           </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
