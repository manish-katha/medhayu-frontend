
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Input } from './input';

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ id, value, onChange, placeholder, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const newTags = pasteData.split(',').map(tag => tag.trim()).filter(tag => tag && !value.includes(tag));
    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      {value.map((tag, index) => (
        <Badge key={tag + index} variant="secondary" className="gap-1.5">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="bg-transparent flex-1 outline-none min-w-[120px] placeholder:text-muted-foreground"
      />
    </div>
  );
}
