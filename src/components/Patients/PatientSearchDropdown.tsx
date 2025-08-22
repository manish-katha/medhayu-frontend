
'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PatientData } from '@/types/patient';
import { getPatients } from '@/actions/patient.actions';

interface PatientSearchDropdownProps {
  onSelectPatient: (patient: PatientData | 'new') => void;
  selectedPatient?: PatientData | null;
}

const PatientSearchDropdown: React.FC<PatientSearchDropdownProps> = ({ 
  onSelectPatient, 
  selectedPatient 
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      getPatients().then(result => {
        if(result.success && result.data?.patients) {
            setPatients(result.data.patients);
        } else {
            toast({ title: 'Error fetching patients', variant: 'destructive'});
        }
      });
    }
  }, [open, toast]);

  const filteredPatients = searchValue === '' 
    ? patients 
    : patients.filter(patient => 
        patient.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchValue))
      );
  
  const handleSelect = (patient: PatientData | 'new') => {
    onSelectPatient(patient);
    setOpen(false);
    if (patient !== 'new') {
      toast({
        title: "Patient Selected",
        description: `${patient.name} has been selected.`,
      });
    }
  };
  
  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className="w-full justify-between"
          >
            {selectedPatient && selectedPatient.name ? (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-ayurveda-green/20 flex items-center justify-center text-ayurveda-green mr-2">
                  {selectedPatient.name.charAt(0)}
                </div>
                <span>{selectedPatient.name}</span>
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                <span>Select patient</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" sideOffset={5}>
          <Command>
            <CommandInput 
              placeholder="Search patients by name or phone..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No patients found.</CommandEmpty>
              <CommandGroup>
                 <CommandItem
                  onSelect={() => handleSelect('new')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center text-ayurveda-green">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add New Patient</span>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Existing Patients">
                {filteredPatients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    onSelect={() => handleSelect(patient)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-ayurveda-green/20 flex items-center justify-center text-ayurveda-green mr-2">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-8">
                        {patient.age} yrs • {patient.gender} • {patient.phone}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PatientSearchDropdown;
