
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center justify-center w-full', className)} {...props}>
    {children}
  </div>
));
Stepper.displayName = 'Stepper';

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  isCompleted?: boolean;
  children?: React.ReactNode;
}

export const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, isActive, isCompleted, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
        isActive ? 'bg-primary border-primary text-primary-foreground' : '',
        isCompleted ? 'bg-ayurveda-green border-ayurveda-green text-white' : '',
        !isActive && !isCompleted ? 'bg-muted border-border' : '',
        className
      )}
      {...props}
    >
      {isCompleted ? <Check/> : children}
    </div>
  )
);
StepperItem.displayName = 'StepperItem';


interface StepperLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
}

export const StepperLabel = React.forwardRef<HTMLSpanElement, StepperLabelProps>(
    ({ className, children, ...props }, ref) => (
        <span ref={ref} className={cn('text-xs font-medium text-muted-foreground mt-2', className)} {...props}>
            {children}
        </span>
    )
);
StepperLabel.displayName = 'StepperLabel';


export const StepperSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex-1 h-px bg-border', className)} {...props} />
    )
);
StepperSeparator.displayName = 'StepperSeparator';
