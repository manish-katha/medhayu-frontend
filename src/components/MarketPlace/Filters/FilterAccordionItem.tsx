
import React, { ReactNode } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FilterAccordionItemProps {
  value: string;
  title: string;
  children: ReactNode;
}

const FilterAccordionItem = ({ value, title, children }: FilterAccordionItemProps) => {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FilterAccordionItem;
