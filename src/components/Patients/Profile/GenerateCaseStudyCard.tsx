
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Visit, CaseStudy as CaseStudyType } from '@/types/patient-profile';
import { format } from 'date-fns';
import { MoreVertical, Eye, Share2, Trash2, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';


interface GenerateCaseStudyCardProps {
    visit: Visit;
    existingCaseStudy?: CaseStudyType;
    onGenerate: (visit: Visit) => void;
    view: 'list' | 'grid' | 'masonry';
}

const GenerateCaseStudyCard: React.FC<GenerateCaseStudyCardProps> = ({ visit, existingCaseStudy, onGenerate, view }) => {
    if (view === 'list') {
        return (
             <div className="flex justify-between items-center p-2 border rounded-md">
                <div>
                    <p className="font-medium">{visit.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">Visit Date: {format(new Date(visit.date), 'PPP')}</p>
                </div>
                 {existingCaseStudy ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Manage
                                <MoreVertical className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Case Study</DropdownMenuItem>
                            <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" />Share to Medhayu</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button size="sm" onClick={() => onGenerate(visit)}>
                        <FileText size={16} className="mr-2"/> Generate
                    </Button>
                )}
            </div>
        )
    }

    return (
        <Card className={cn("break-inside-avoid", view === 'grid' && 'h-full flex flex-col')}>
            <CardHeader className="flex-grow">
                <CardTitle>{visit.diagnosis}</CardTitle>
                <CardDescription>
                    Visit Date: {format(new Date(visit.date), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardFooter className="border-t pt-4">
                 {existingCaseStudy ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Manage
                                <MoreVertical className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Case Study</DropdownMenuItem>
                            <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" />Share to Medhayu</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button className="w-full" onClick={() => onGenerate(visit)}>
                        <FileText size={16} className="mr-2"/> Generate
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default GenerateCaseStudyCard;
