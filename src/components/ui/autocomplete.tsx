
'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  onSelect?: (value: string) => void;
  onCreateNew?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  onSelect,
  onCreateNew,
  placeholder,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  React.useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      setInputValue(selectedOption ? selectedOption.label : value);
    } else {
      setInputValue("");
    }
  }, [value, options]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    if (onSelect) {
      onSelect(selectedValue);
    }
    setOpen(false);
  };
  
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew(inputValue);
    }
    onValueChange(inputValue);
    setOpen(false);
  };

  const filteredOptions = inputValue ? options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  ) : options;

  const showCreateOption = onCreateNew && inputValue && !options.some(option => option.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full", className)}>
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="w-full pr-10"
            />
            <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                onClick={() => setOpen(!open)}
            >
                <ChevronsUpDown className="h-4 w-4" />
            </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search or create..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
             <CommandEmpty>
              No results found.
             </CommandEmpty>
            <CommandGroup>
              {showCreateOption && (
                <CommandItem onSelect={handleCreateNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create "{inputValue}"
                </CommandItem>
              )}
              {filteredOptions.map((option, index) => (
                <CommandItem
                  key={option.value || index}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
