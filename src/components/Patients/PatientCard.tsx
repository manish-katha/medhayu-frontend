

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, User, Stethoscope, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { PatientData } from '@/types/patient';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PatientCard = ({ id, name, age, gender, phone, condition, profilePic, onDelete }: PatientData & { onDelete: () => void; }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleCardClick = () => {
    router.push(`/patients/${id}`);
  };

  const handleNewVisit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    toast({
      title: "New visit created",
      description: `Starting new consultation for ${name}`,
    });
    
    const params = new URLSearchParams({
      patientName: name,
      patientAge: age.toString(),
      patientGender: gender,
      patientId: id.toString(),
      isNewVisit: 'true'
    });
    router.push(`/prescriptions?${params.toString()}`);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profilePic} alt={name} />
                <AvatarFallback className="text-xl bg-ayurveda-ochre/20 text-ayurveda-ochre">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {age} / {gender}
                </div>
              </div>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Logic to edit */ }}>
                        <Edit size={14} className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
                <Phone size={14} className="mr-2" />
                <span>{phone}</span>
            </div>
            {condition && (
            <div className="flex items-center">
                <Stethoscope size={14} className="mr-2" />
                <span>{condition}</span>
            </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button className="w-full bg-ayurveda-green hover:bg-ayurveda-green/90" onClick={handleNewVisit}>
          <Plus size={16} className="mr-2" />
          New Visit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
