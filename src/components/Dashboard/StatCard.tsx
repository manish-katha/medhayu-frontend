
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  chartData?: any[];
  chartKey?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, description, trend, chartData, chartKey, className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden h-full w-full", className)}>
      <CardContent className="p-2 sm:p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <div className="bg-primary/10 p-1.5 sm:p-2 rounded-md flex-shrink-0">
            {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
          </div>
        </div>
        <div className="flex items-end gap-2">
            <div className="flex-grow">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{value}</h3>
                <div className="flex items-center text-xs mt-1">
                    {trend && (
                    <span className={cn(
                        "font-medium flex items-center",
                        trend.positive ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.positive ? <ArrowUp size={12} className="mr-1"/> : <ArrowDown size={12} className="mr-1"/>}
                        {Math.abs(trend.value)}%
                    </span>
                    )}
                    {description && (
                    <span className="text-muted-foreground ml-1 truncate">{description}</span>
                    )}
                </div>
            </div>
            {chartData && chartKey && (
                <div className="w-1/3 h-12 flex-shrink-0 hidden sm:block">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <Line 
                                type="monotone" 
                                dataKey={chartKey} 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                dot={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
