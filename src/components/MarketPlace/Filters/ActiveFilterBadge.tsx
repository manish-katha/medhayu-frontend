
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActiveFilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const ActiveFilterBadge = ({ label, onRemove }: ActiveFilterBadgeProps) => {
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {label}
      <button className="ml-1 text-xs" onClick={onRemove}>×</button>
    </Badge>
  );
};

export default ActiveFilterBadge;
