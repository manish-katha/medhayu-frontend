
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PrescriptionHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PrescriptionHeader: React.FC<PrescriptionHeaderProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-semibold text-ayurveda-brown">Prescription Management</h1>
      <div className="relative flex-grow sm:max-w-[250px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search prescriptions..." 
          className="pl-8 w-full" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PrescriptionHeader;
