
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrescriptionListProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  activeTab,
  setActiveTab,
  sortOrder,
  setSortOrder
}) => {
  const prescriptionData = [
    {
      id: 1,
      patient: "Amit Patel",
      date: "2023-05-01",
      type: "General Consultation",
      status: "Completed"
    },
    {
      id: 2,
      patient: "Priya Sharma",
      date: "2023-05-02",
      type: "Follow-up",
      status: "Completed"
    },
    {
      id: 3,
      patient: "Raj Kumar",
      date: "2023-05-03",
      type: "Panchakarma",
      status: "In Progress"
    },
    {
      id: 4,
      patient: "Meera Iyer",
      date: "2023-05-04",
      type: "General Consultation",
      status: "Completed"
    },
    {
      id: 5,
      patient: "Vikram Singh",
      date: "2023-05-05",
      type: "Follow-up",
      status: "Scheduled"
    },
  ];

  return (
    <Card>
      <CardHeader className="bg-ayurveda-green/5 border-b p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
            <TabsList>
              <TabsTrigger value="all">All Prescriptions</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center">
              <span className="text-sm mr-2">Sort by:</span>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Patient Name</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="rounded-md">
          <PrescriptionTableHeader />
          <PrescriptionTableContent prescriptions={prescriptionData} />
          <PrescriptionTablePagination />
        </div>
      </CardContent>
    </Card>
  );
};

const PrescriptionTableHeader: React.FC = () => {
  return (
    <div className="bg-muted py-2 px-4 flex items-center font-medium text-sm border-b">
      <div className="w-3/12 md:w-2/12 flex items-center gap-1">
        Patient
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <ArrowUpDown size={12} />
        </Button>
      </div>
      <div className="w-3/12 md:w-2/12 hidden md:flex items-center gap-1">
        Date
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <ArrowUpDown size={12} />
        </Button>
      </div>
      <div className="w-3/12 md:w-3/12 flex items-center gap-1">
        Type
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <ArrowUpDown size={12} />
        </Button>
      </div>
      <div className="w-3/12 md:w-3/12 hidden md:block">Status</div>
      <div className="w-3/12 md:w-2/12 text-right">Actions</div>
    </div>
  );
};

interface Prescription {
  id: number;
  patient: string;
  date: string;
  type: string;
  status: string;
}

interface PrescriptionTableContentProps {
  prescriptions: Prescription[];
}

const PrescriptionTableContent: React.FC<PrescriptionTableContentProps> = ({ prescriptions }) => {
  return (
    <div className="divide-y">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="px-4 py-3 flex items-center text-sm">
          <div className="w-3/12 md:w-2/12 font-medium">
            {prescription.patient}
          </div>
          <div className="w-3/12 md:w-2/12 hidden md:block text-muted-foreground">
            {new Date(prescription.date).toLocaleDateString()}
          </div>
          <div className="w-3/12 md:w-3/12">
            {prescription.type}
          </div>
          <div className="w-3/12 md:w-3/12 hidden md:flex">
            <span className={`px-2 py-1 rounded-full text-xs ${
              prescription.status === 'Completed' 
                ? 'bg-green-100 text-green-800'
                : prescription.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {prescription.status}
            </span>
          </div>
          <div className="w-3/12 md:w-2/12 flex gap-1 justify-end">
            <Button variant="outline" size="sm" className="h-8">View</Button>
            <Button variant="outline" size="sm" className="h-8">Edit</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const PrescriptionTablePagination: React.FC = () => {
  return (
    <div className="flex justify-between items-center p-4 border-t">
      <p className="text-sm text-muted-foreground">
        Showing 5 of 37 prescriptions
      </p>
      <div className="flex space-x-1">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <Button variant="outline" size="sm" className="bg-ayurveda-green/10">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
};

export default PrescriptionList;
