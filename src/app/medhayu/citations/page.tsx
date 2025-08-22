

'use client';

import { getCitationData, type Citation, type CitationCategory } from "@/services/citation.service";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Folder, BookHeart, Library, Quote, Plus, X, FolderPlus } from "lucide-react";
import Link from 'next/link';
import { BulkCitationImporterDialog, CreateCitationCategoryDialog, CollectionActions } from "@/components/admin/citation-forms";
import { CreateQuoteDialog } from "@/components/admin/quote-forms";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

function CitationTable({ citations }: { citations: Citation[] | undefined }) {
    if (!citations || citations.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No citations found in this collection.</p>
            </div>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Ref ID</TableHead>
                    <TableHead>Sanskrit</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Source</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {citations.map((citation) => (
                    <TableRow key={citation.refId}>
                        <TableCell className="font-medium">{citation.refId}</TableCell>
                        <TableCell className="text-muted-foreground italic">"{citation.sanskrit.substring(0, 50)}..."</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {citation.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                            </div>
                        </TableCell>
                        <TableCell>{citation.source} - {citation.location}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function CitationsPage() {
    const [allCitationData, setAllCitationData] = useState<CitationCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isFabOpen, setFabOpen] = useState(false);
    const [isCreateCitationOpen, setCreateCitationOpen] = useState(false);
    const [isCreateCategoryOpen, setCreateCategoryOpen] = useState(false);
    const [isBulkImportOpen, setBulkImportOpen] = useState(false);
    
    const fetchCitations = useCallback(() => {
        setIsLoading(true);
        getCitationData().then(data => {
            setAllCitationData(data);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchCitations();
    }, [fetchCitations]);
    
    const userNotesCollection = allCitationData.find(cat => cat.id === 'user-saved-notes');
    const libraryCollections = allCitationData.filter(cat => cat.id !== 'user-saved-notes');
    
    const fabOptions = [
        { label: 'New Citation', icon: Quote, action: () => setCreateCitationOpen(true) },
        { label: 'New Collection', icon: FolderPlus, action: () => setCreateCategoryOpen(true) },
        { label: 'Bulk Import', icon: Upload, action: () => setBulkImportOpen(true) },
    ];
    
    if (isLoading) {
        return <div className="medhayu-module-container"><PageSkeleton /></div>;
    }

    return (
        <div className="medhayu-module-container space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Citation Library</h1>
            </div>
            
            <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="library">Library Collections</TabsTrigger>
                    <TabsTrigger value="user">User-Saved Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="library" className="pt-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Library Collections</CardTitle>
                            <CardDescription>
                                Curated collections of citations from various texts. Click a collection to manage its contents.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {libraryCollections.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {libraryCollections.map(category => (
                                        <Card key={category.id} className="flex flex-col">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <Link href={`/medhayu/citations/${category.id}`} className="block group flex-1">
                                                        <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                                                             <Library className="h-6 w-6" />
                                                            {category.name}
                                                        </CardTitle>
                                                    </Link>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">{category.citations.length}</Badge>
                                                        <CollectionActions category={category} onActionComplete={fetchCitations} />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground">Manage the citations in the "{category.name}" collection.</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                    <p className="mb-2">Your citation library is empty.</p>
                                    <p className="text-sm">Create a collection to get started.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="user" className="pt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>User-Saved Notes</CardTitle>
                            <CardDescription>
                                These are citations you have personally saved while reading articles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CitationTable citations={userNotesCollection?.citations} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                {isFabOpen &&
                    fabOptions.map((option, index) => (
                    <motion.div
                        key={option.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center gap-2"
                    >
                        <span className="rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-md">
                        {option.label}
                        </span>
                        <Button className="h-12 w-12 rounded-full" size="icon" onClick={option.action}>
                            <option.icon className="h-6 w-6" />
                        </Button>
                    </motion.div>
                    ))}
                </AnimatePresence>

                <Button
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg"
                onClick={() => setFabOpen(!isFabOpen)}
                >
                {isFabOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
                </Button>
            </div>

            <BulkCitationImporterDialog open={isBulkImportOpen} onOpenChange={setBulkImportOpen}>
            </BulkCitationImporterDialog>
            <CreateCitationCategoryDialog open={isCreateCategoryOpen} onOpenChange={(open) => { setCreateCategoryOpen(open); if(!open) fetchCitations(); }}>
            </CreateCitationCategoryDialog>
            <CreateQuoteDialog open={isCreateCitationOpen} onOpenChange={setCreateCitationOpen} categories={allCitationData} onQuoteCreated={() => {}} />

        </div>
    )
}
