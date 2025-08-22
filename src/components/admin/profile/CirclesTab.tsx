
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, UserPlus, Stethoscope, BookOpen, Building, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import type { Circle, UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CircleFormDialog } from './CircleFormDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DeleteConfirmationDialog from '@/components/Patients/Profile/DeleteConfirmationDialog';
import { useToast } from '@/hooks/use-toast';
import { deleteCircle } from '@/actions/circle.actions';

interface CirclesTabProps {
  circles: Circle[];
}

const CircleCard = ({ circle, onDeleteClick }: { circle: Circle; onDeleteClick: () => void }) => {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={circle.avatarUrl} alt={circle.name} />
                        <AvatarFallback>
                            {circle.category === 'clinical' && <Stethoscope />}
                            {circle.category === 'shastra' && <BookOpen />}
                            {circle.category === 'institutional' && <Building />}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{circle.name}</CardTitle>
                        <CardDescription>{circle.members.length} members</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-3 h-10 line-clamp-2">{circle.description}</p>
                <div className="flex items-center -space-x-2">
                    {circle.members && circle.members.length > 0 && circle.members.slice(0, 5).map(member => (
                       <Avatar key={member.userId} className="h-8 w-8 border-2 border-background">
                         <AvatarImage src={member.avatarUrl} alt={member.name} />
                         <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                    ))}
                    {circle.members && circle.members.length > 5 && (
                       <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                         +{circle.members.length - 5}
                       </div>
                    )}
                </div>
            </CardContent>
             <CardFooter className="border-t pt-4">
                <div className="flex w-full justify-between items-center">
                    <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>View</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16}/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Edit Circle</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDeleteClick}>
                                <Trash2 className="mr-2 h-4 w-4"/>Delete Circle
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    )
}

const CircleCategorySection = ({ title, description, icon, circles, category, onCircleCreated, onCircleDeleted }: { title: string, description: string, icon: React.ReactNode, circles: Circle[], category: 'clinical' | 'shastra' | 'institutional', onCircleCreated: () => void, onCircleDeleted: (id: string) => void }) => {
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    if (!circleToDelete) return;
    const result = await deleteCircle(circleToDelete.id);
    if (result.success) {
      toast({ title: 'Circle Deleted', description: `The circle "${circleToDelete.name}" has been deleted.` });
      onCircleDeleted(circleToDelete.id);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setCircleToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-3">{icon} {title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>
                <CircleFormDialog 
                  category={category} 
                  onCircleCreated={onCircleCreated}
                  trigger={<Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />New Circle</Button>}
                />
            </div>
        </CardHeader>
        <CardContent>
            {circles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {circles.map(circle => <CircleCard key={circle.id} circle={circle} onDeleteClick={() => setCircleToDelete(circle)} />)}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No circles in this category yet.</p>
                </div>
            )}
        </CardContent>
      </Card>
      {circleToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!circleToDelete}
          onOpenChange={(isOpen) => !isOpen && setCircleToDelete(null)}
          onConfirm={handleDeleteConfirm}
          resourceName={circleToDelete.name}
          resourceType="circle"
        />
      )}
    </>
  );
};


const CirclesTab: React.FC<{ circles: Circle[] }> = ({ circles: initialCircles }) => {
  const [circles, setCircles] = useState(initialCircles);

  // This will be called by the dialog on success to refresh the list
  const handleCircleChange = () => {
    // In a real app, you'd fetch the updated list. Here we just trigger a re-render.
    // For now, this is a placeholder. The revalidatePath in the action should handle it.
  };

  const clinicalCircles = circles.filter(c => c.category === 'clinical');
  const shastraCircles = circles.filter(c => c.category === 'shastra');
  const institutionalCircles = circles.filter(c => c.category === 'institutional');

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                <span>My Circles</span>
                </CardTitle>
                <CardDescription>
                    Join or create circles based on clinical specialties, shastra studies, or institutions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <CircleCategorySection
                    title="Clinical Specialty Groups"
                    description="Circles for Vaidyas to discuss specific clinical areas like skin disorders, autoimmune conditions, etc."
                    icon={<Stethoscope className="text-ayurveda-green" />}
                    circles={clinicalCircles}
                    category="clinical"
                    onCircleCreated={handleCircleChange}
                    onCircleDeleted={(id) => setCircles(prev => prev.filter(c => c.id !== id))}
                />
                <CircleCategorySection
                    title="Shastra Study Groups"
                    description="Groups dedicated to the systematic reading and interpretation of classical Ayurvedic texts."
                    icon={<BookOpen className="text-ayurveda-ochre" />}
                    circles={shastraCircles}
                    category="shastra"
                    onCircleCreated={handleCircleChange}
                    onCircleDeleted={(id) => setCircles(prev => prev.filter(c => c.id !== id))}
                />
                <CircleCategorySection
                    title="Institutional Circles"
                    description="Connect with peers from your Gurukula, BAMS college, or research institution."
                    icon={<Building className="text-ayurveda-terracotta" />}
                    circles={institutionalCircles}
                    category="institutional"
                    onCircleCreated={handleCircleChange}
                    onCircleDeleted={(id) => setCircles(prev => prev.filter(c => c.id !== id))}
                />
            </CardContent>
        </Card>
    </div>
  );
};

export default CirclesTab;
