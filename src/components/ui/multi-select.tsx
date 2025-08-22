
'use client';

import React, { useState } from 'react';
import { X, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Button } from './button';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected?: string[];
  onSelectionChange?: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected: initialSelected = [], onSelectionChange, placeholder = 'Select...' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleUnselect = (value: string) => {
    const newSelected = selected.filter((s) => s !== value);
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 font-normal"
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(value);
                  }}
                >
                  {options.find(o => o.value === value)?.label || value}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                      selected.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    }`}
                  >
                  </div>
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
