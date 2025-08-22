
import React from 'react';
import { cn } from '@/lib/utils';

interface StockStatusBadgeProps {
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  className?: string;
}

const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ status, className }) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs";
  
  const statusClasses = {
    'In Stock': "bg-ayurveda-green/20 text-ayurveda-green",
    'Low Stock': "bg-ayurveda-terracotta/20 text-ayurveda-terracotta",
    'Out of Stock': "bg-red-500/20 text-red-500",
  };
  
  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {status}
    </span>
  );
};

export default StockStatusBadge;
