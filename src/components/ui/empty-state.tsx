
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-muted/20",
        className
      )}
    >
      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
