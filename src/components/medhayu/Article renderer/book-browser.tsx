
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List, Library, Globe, Lock, Users, ChevronRight, ChevronDown, BookOpenCheck, BookOpen, Edit, Layers3 } from 'lucide-react';
import type { Book, GroupedBook, SeriesGroup } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { BookActions } from './book-actions';
import { Checkbox } from '../ui/checkbox';
import { GroupAsSeriesDialog, EditSeriesDescriptionDialog } from './book-forms';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const visibilityConfig: Record<Book['visibility'], { icon: React.ElementType, label: string, variant: BadgeProps['variant'] }> = {
    private: { icon: Lock, label: 'Private', variant: 'secondary' },
    circle: { icon: Users, label: 'Circle', variant: 'info' },
    public: { icon: Globe, label: 'Public', variant: 'success' },
}

function VisibilityBadge({ visibility }: { visibility: Book['visibility'] }) {
    const config = visibilityConfig[visibility] || visibilityConfig.private;
    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={config.variant} className="capitalize">
                        <config.icon className="mr-1 h-3 w-3" />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Visibility: {config.label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


function BookCard({ book, isSelectable = false, isSelected = false, onSelect }: { book: Book, isSelectable?: boolean, isSelected?: boolean, onSelect?: (bookId: string) => void }) {
    return (
        <div className="relative">
             {isSelectable && (
                <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => onSelect?.(book.id)} 
                    className="absolute top-2 left-2 z-20 h-6 w-6 bg-background/80"
                    aria-label={`Select book ${book.name}`}
                />
            )}
            <Card className={cn("group flex flex-col overflow-hidden h-full", isSelected && "ring-2 ring-primary")}>
                <Link href={`/admin/books/${book.id}`} className="block overflow-hidden">
                    <div className="relative aspect-[3/4] w-full bg-muted">
                        {book.profileUrl && (
                            <Image 
                                src={book.profileUrl} 
                                alt={book.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                data-ai-hint="book cover"
                            />
                        )}
                    </div>
                </Link>
                <CardFooter className="p-3 flex-col items-start bg-background/90 z-10 mt-auto">
                    <div className="w-full flex justify-between items-start">
                        <Link href={`/admin/books/${book.id}`} className="flex-1 pr-2">
                            <p className="font-semibold text-sm leading-tight hover:underline truncate">{book.name}</p>
                            {book.volumeInfo && <p className="text-xs text-muted-foreground">Vol. {book.volumeInfo.volumeNumber}</p>}
                        </Link>
                        <div className="-mr-1 -mt-1 shrink-0">
                            <BookActions book={book} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <VisibilityBadge visibility={book.visibility} />
                        {book.isAnnounced && <Badge variant="secondary">Announced</Badge>}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

function BookListItem({ book }: { book: Book }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
            <Link href={`/admin/books/${book.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative h-12 w-9 bg-muted rounded-sm flex-shrink-0">
                    {book.profileUrl && (
                        <Image src={book.profileUrl} alt={book.name} fill className="object-cover rounded-sm" sizes="36px" data-ai-hint="book cover"/>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{book.name}</p>
                    {book.volumeInfo && <p className="text-xs text-muted-foreground">{book.volumeInfo.seriesName} - Vol. {book.volumeInfo.volumeNumber}</p>}
                </div>
            </Link>
             <div className="flex items-center gap-2 pl-4">
                <VisibilityBadge visibility={book.visibility} />
                {book.isAnnounced && <Badge variant="secondary">Announced</Badge>}
                <BookActions book={book} />
            </div>
        </div>
    )
}

function SeriesCard({ series }: { series: SeriesGroup }) {
  const [isOpen, setIsOpen] = useState(false);
  const [volumeView, setVolumeView] = useState<'grid' | 'list'>('grid');
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);

  const firstVolume = series.volumes[0];

  return (
    <>
      <EditSeriesDescriptionDialog
        seriesName={series.seriesName}
        initialDescription={series.description || ''}
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
      />
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <Card className="group overflow-hidden flex flex-col h-full transition-shadow hover:shadow-xl">
          <CollapsibleTrigger asChild>
              <div className='cursor-pointer flex flex-col flex-grow'>
                  <CardHeader className="flex-row items-center gap-4">
                      <div className="relative h-20 w-14 bg-muted rounded-md flex-shrink-0 shadow-md">
                          <Image
                              src={firstVolume.profileUrl || 'https://placehold.co/400x600.png'}
                              alt={`${series.seriesName} cover`}
                              fill
                              className="object-cover rounded-md"
                              sizes="56px"
                              data-ai-hint="book cover"
                          />
                      </div>
                      <div>
                          <CardTitle className="text-xl font-headline">{series.seriesName}</CardTitle>
                          <CardDescription>{series.volumes.length} volumes in this series.</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-1 relative group/desc">
                       <p className="text-sm text-muted-foreground line-clamp-3">
                        {series.description || 'No description available for this series.'}
                      </p>
                      <Button variant="outline" size="icon" className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover/desc:opacity-100 transition-opacity" onClick={(e) => {e.stopPropagation(); setIsDescriptionDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                  </CardContent>
              </div>
          </CollapsibleTrigger>
          <CardFooter className="p-4 bg-muted/30">
              <CollapsibleTrigger asChild>
                   <Button className="w-full">
                      <BookOpenCheck className="mr-2 h-4 w-4"/>
                      Explore Series
                  </Button>
              </CollapsibleTrigger>
          </CardFooter>
          <CollapsibleContent>
              <Separator />
              <div className="p-4 space-y-4">
                   <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Volumes</h4>
                      <ToggleGroup type="single" size="sm" value={volumeView} onValueChange={(v) => { if(v) setVolumeView(v as any)}}>
                          <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                          <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                      </ToggleGroup>
                   </div>
                   {volumeView === 'grid' ? (
                       <div className="grid grid-cols-2 gap-2">
                          {series.volumes.map(book => <BookCard key={book.id} book={book} isSelectable={false} />)}
                      </div>
                   ) : (
                      <div className="space-y-1">
                          {series.volumes.map(book => <BookListItem key={book.id} book={book} />)}
                      </div>
                   )}
              </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </>
  );
}

function SeriesListItem({ series }: { series: SeriesGroup }) {
    return (
        <AccordionItem value={series.seriesName}>
            <AccordionTrigger className="hover:no-underline p-4">
                <div className="flex items-center gap-4">
                     <div className="relative h-20 w-14 bg-muted rounded-md flex-shrink-0 shadow-md">
                         <Image 
                            src={series.volumes[0].profileUrl || 'https://placehold.co/400x600.png'} 
                            alt={`${series.seriesName} cover`}
                            fill
                            className="object-cover rounded-md"
                            sizes="56px"
                            data-ai-hint="book cover"
                        />
                     </div>
                     <div>
                        <h3 className="text-xl font-semibold text-left">{series.seriesName}</h3>
                        <p className="text-sm text-muted-foreground text-left">{series.volumes.length} volumes in this series.</p>
                     </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                 <div className="p-4 bg-muted/50 rounded-b-md">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {series.volumes.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

function SeriesDisplay({ series, view }: { series: SeriesGroup[], view: 'grid' | 'list' }) {
    if (series.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No book series found.</p>
            </div>
        );
    }
    
    if (view === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {series.map(s => <SeriesCard key={s.seriesName} series={s} />)}
            </div>
        )
    }

    return (
        <Accordion type="multiple" className="space-y-4">
            {series.map(s => <SeriesListItem key={s.seriesName} series={s} />)}
        </Accordion>
    );
}


function StandaloneBooksDisplay({ books, view }: { books: Book[], view: 'grid' | 'list' }) {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };
  
  if (books.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No standalone books found.</p>
        </div>
      );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Standalone Books</CardTitle>
            <CardDescription>Books that are not part of a series.</CardDescription>
          </div>
           {selectedBooks.length > 0 && (
                <GroupAsSeriesDialog selectedBookIds={selectedBooks} onComplete={() => setSelectedBooks([])}>
                    <Button>
                        <Library className="mr-2 h-4 w-4" /> Group {selectedBooks.length} Books as Series
                    </Button>
                </GroupAsSeriesDialog>
            )}
        </div>
      </CardHeader>
      <CardContent>
         {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.map(book => <BookCard key={book.id} book={book} isSelectable onSelect={handleSelectBook} isSelected={selectedBooks.includes(book.id)} />)}
            </div>
         ) : (
             <div className="space-y-2">
                {books.map(book => <BookListItem key={book.id} book={book} />)}
            </div>
         )}
      </CardContent>
    </Card>
  );
}


export function BookBrowser({ groupedBooks }: { groupedBooks: GroupedBook[] }) {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('series');

    const allStandalone = useMemo(() => groupedBooks.flatMap(g => g.standaloneBooks), [groupedBooks]);
    const allSeries = useMemo(() => {
        const seriesMap: { [seriesName: string]: SeriesGroup } = {};
        groupedBooks.forEach(group => {
            group.series.forEach(s => {
                if (!seriesMap[s.seriesName]) {
                    seriesMap[s.seriesName] = { seriesName: s.seriesName, description: s.description, volumes: [] };
                }
                seriesMap[s.seriesName].volumes.push(...s.volumes);
                if (s.description) {
                    seriesMap[s.seriesName].description = s.description;
                }
            });
        });
        Object.values(seriesMap).forEach(s => {
            s.volumes.sort((a, b) => (a.volumeInfo?.volumeNumber || 0) - (b.volumeInfo?.volumeNumber || 0))
            if(!s.description && s.volumes[0]?.shortDescription) {
                s.description = s.volumes[0].shortDescription;
            }
        });
        return Object.values(seriesMap);
    }, [groupedBooks]);
    
    const tabs = [
        { id: 'series', icon: Layers3, label: `Series (${allSeries.length})`, content: <SeriesDisplay series={allSeries} view={view} /> },
        { id: 'standalone', icon: BookOpen, label: `Standalone (${allStandalone.length})`, content: <StandaloneBooksDisplay books={allStandalone} view={view} /> },
    ];

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-4">
                <div>
                    <CardTitle>Your Library</CardTitle>
                    <CardDescription>Browse all your authored and collected works.</CardDescription>
                </div>
                 <ToggleGroup type="single" value={view} onValueChange={(v) => { if (v) setView(v as any) }}>
                    <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
            </CardHeader>
            <CardContent>
                 <div className="border-b">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                          {tabs.map(tab => (
                              <TabsTrigger key={tab.id} value={tab.id}>
                                  <tab.icon className="mr-2 h-4 w-4" />
                                  {tab.label}
                              </TabsTrigger>
                          ))}
                        </TabsList>
                    </Tabs>
                </div>
                 <div className="pt-6">
                    {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
            </CardContent>
        </Card>
    );
}
