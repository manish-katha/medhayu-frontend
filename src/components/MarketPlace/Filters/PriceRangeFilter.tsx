
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  defaultValue: [number, number];
  step: number;
  onValueChange?: (value: [number, number]) => void;
}

const PriceRangeFilter = ({ 
  min, 
  max, 
  defaultValue,
  step, 
  onValueChange
}: PriceRangeFilterProps) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    // Debounce the change to avoid excessive re-renders
    const handler = setTimeout(() => {
        if(onValueChange) {
            onValueChange(value);
        }
    }, 500);

    return () => clearTimeout(handler);
  }, [value, onValueChange]);
  
  return (
    <div className="space-y-4 pt-2">
      <Slider 
        defaultValue={defaultValue} 
        min={min} 
        max={max} 
        step={step}
        onValueChange={(val) => setValue(val as [number, number])}
        value={value}
      />
      <div className="flex items-center justify-between">
        <div className="border rounded px-2 py-1 text-sm">₹{value[0]}</div>
        <div className="text-sm text-muted-foreground">to</div>
        <div className="border rounded px-2 py-1 text-sm">₹{value[1] === max ? `${max}+` : value[1]}</div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
