

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PatientFiltersProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onClear: () => void;
}

// Helper function to toggle a filter in the list
const toggleFilter = (
  filter: string,
  checked: boolean,
  currentFilters: string[],
  onFilterChange: (filters: string[]) => void
) => {
  if (checked) {
    onFilterChange([...currentFilters, filter]);
  } else {
    onFilterChange(currentFilters.filter(f => f !== filter));
  }
};

const PatientFilters = ({ selectedFilters, onFilterChange, onClear }: PatientFiltersProps) => {
  const conditions = [
    'Vata Imbalance', 'Pitta Disorder', 'Kapha Excess',
    'Arthritis', 'Diabetes', 'Respiratory Issues', 
    'Digestive Problems', 'Skin Conditions'
  ];
  
  const gender = ['Male', 'Female', 'Other'];
  
  const ageRanges = ['0-18', '19-35', '36-50', '51-65', '65+'];
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-1">Filters:</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Condition <ChevronDown size={14} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {conditions.map(condition => (
                <DropdownMenuCheckboxItem
                  key={condition}
                  checked={selectedFilters.includes(condition)}
                  onCheckedChange={(checked) => toggleFilter(condition, !!checked, selectedFilters, onFilterChange)}
                >
                  {condition}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Gender <ChevronDown size={14} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {gender.map(item => (
                <DropdownMenuCheckboxItem
                  key={item}
                  checked={selectedFilters.includes(item)}
                  onCheckedChange={(checked) => toggleFilter(item, !!checked, selectedFilters, onFilterChange)}
                >
                  {item}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Age <ChevronDown size={14} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {ageRanges.map(range => (
                <DropdownMenuCheckboxItem
                  key={range}
                  checked={selectedFilters.includes(range)}
                  onCheckedChange={(checked) => toggleFilter(range, !!checked, selectedFilters, onFilterChange)}
                >
                  {range}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-8">
            Last Visit <ChevronDown size={14} className="ml-2" />
          </Button>
          
          {selectedFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-muted-foreground hover:text-foreground"
              onClick={onClear}
            >
              Clear all
            </Button>
          )}
        </div>
        
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedFilters.map(filter => (
              <div 
                key={filter} 
                className="bg-ayurveda-green/10 text-ayurveda-green text-xs px-3 py-1 rounded-full flex items-center"
              >
                {filter}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => toggleFilter(filter, false, selectedFilters, onFilterChange)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
