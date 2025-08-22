import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <Card className="bg-muted/30">
    <CardContent className="p-4 flex items-center">
      <div className="p-2 bg-ayurveda-green/10 text-ayurveda-green rounded-full mr-3">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">
            {label}: <span className="font-bold text-foreground">{value}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
