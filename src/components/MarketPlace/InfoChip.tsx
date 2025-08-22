'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InfoChipProps {
  label: string;
  value: string | string[] | undefined;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoChip: React.FC<InfoChipProps> = ({ label, value, icon, className }) => {
  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div className={cn("p-3 rounded-lg border bg-muted/30", className)}>
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">{icon}{label}</div>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.map(v => <Badge key={v} variant="secondary">{v}</Badge>)}
        </div>
      ) : (
        <p className="font-semibold">{value}</p>
      )}
    </div>
  );
};

export default InfoChip;
