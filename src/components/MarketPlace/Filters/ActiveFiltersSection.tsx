
import React from 'react';
import ActiveFilterBadge from './ActiveFilterBadge';

interface ActiveFilter {
  id: string;
  label: string;
}

interface ActiveFiltersSectionProps {
  filters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
}

const ActiveFiltersSection = ({ filters, onRemoveFilter }: ActiveFiltersSectionProps) => {
  if (filters.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <ActiveFilterBadge
            key={filter.id}
            label={filter.label}
            onRemove={() => onRemoveFilter(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveFiltersSection;
