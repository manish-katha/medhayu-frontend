
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CaseStudy } from '@/types/patient-profile';
import { format } from 'date-fns';
import { MoreVertical, Eye, Share2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


interface CaseStudyItemCardProps {
    caseStudy: CaseStudy;
    view: 'list' | 'grid' | 'masonry';
}

const CaseStudyItemCard: React.FC<CaseStudyItemCardProps> = ({ caseStudy, view }) => {
    const router = useRouter();

    const handleView = () => {
        router.push(`/case-studies/${caseStudy.id}`);
    };

    if (view === 'list') {
        return (
             <div className="flex justify-between items-center p-2 border rounded-md">
                <div>
                    <p className="font-medium">{caseStudy.title}</p>
                    <p className="text-sm text-muted-foreground">Version {caseStudy.version} - Saved on: {format(new Date(caseStudy.date), 'PPP')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleView}>View</Button>
            </div>
        )
    }

    return (
        <Card className={cn("break-inside-avoid", view === 'grid' && 'h-full flex flex-col')}>
            <CardHeader>
                <CardTitle>{caseStudy.title}</CardTitle>
                <CardDescription>
                    V{caseStudy.version} - {format(new Date(caseStudy.date), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {caseStudy.summary}
                </p>
                {caseStudy.isPublic && (
                    <Badge variant="secondary" className="mt-2">Public</Badge>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4">
                 <div className="flex justify-between w-full">
                    <Button variant="outline" size="sm" onClick={handleView}><Eye className="mr-2 h-4 w-4"/>View</Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
};

export default CaseStudyItemCard;
