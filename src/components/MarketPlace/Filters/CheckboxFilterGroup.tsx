
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxFilterGroupProps {
  items: string[];
  groupName: string;
  onSelectionChange?: (selectedItems: string[]) => void;
}

const CheckboxFilterGroup = ({ items, groupName, onSelectionChange }: CheckboxFilterGroupProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleCheckedChange = (item: string, checked: boolean) => {
    const newSelected = checked 
        ? [...selected, item]
        : selected.filter(s => s !== item);
    setSelected(newSelected);
    if (onSelectionChange) {
        onSelectionChange(newSelected);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox 
            id={`${groupName}-${item}`} 
            onCheckedChange={(checked) => handleCheckedChange(item, checked === true)}
            checked={selected.includes(item)}
          />
          <Label htmlFor={`${groupName}-${item}`} className="text-sm font-normal cursor-pointer capitalize">
            {item}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxFilterGroup;
