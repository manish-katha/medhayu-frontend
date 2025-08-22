

'use client';

import React from 'react';
import { PatientData, PatientProfileData } from '@/types/patient-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, Heart, Plus, Edit, Stethoscope, Building, Globe } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getPatientProfile } from '@/services/patient.service';
import StatCard from './StatCard';
import VisitsTab from './VisitsTab';
import BillingTab from './BillingTab';
import ReportsTab from './ReportsTab';
import CaseStudiesTab from './CaseStudiesTab';
import OverviewTab from './OverviewTab';
import { Skeleton } from '@/components/ui/skeleton';
import { getPatientById } from '@/actions/patient.actions';

interface PatientProfileProps {
  patientId: string;
}

const PatientProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);


const PatientProfile: React.FC<PatientProfileProps> = ({ patientId }) => {
  const [profileData, setProfileData] = React.useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getPatientProfile(patientId);
      setProfileData(data);
      setIsLoading(false);
    };
    fetchData();
  }, [patientId]);
  
  if (isLoading) {
      return <PatientProfileSkeleton />;
  }

  if (!profileData) {
    return <div>Patient not found.</div>;
  }
  
  const { patient, visits, invoices, lifetimeValue, labReports, caseStudies } = profileData;

  const lastVisit = visits.length > 0 ? new Date(visits[0].date) : null;
  const memberSince = patient.createdAt ? new Date(patient.createdAt) : new Date(); // Fallback

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={patient.profilePic} alt={patient.name} />
              <AvatarFallback className="text-3xl bg-ayurveda-ochre/20 text-ayurveda-ochre">
                {patient.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold font-headline text-ayurveda-brown">{patient.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground mt-2">
                    {patient.cin && <span className="flex items-center gap-1 font-mono text-xs font-semibold"><Building size={14}/> CIN: {patient.cin}</span>}
                    {patient.oid && <span className="flex items-center gap-1 font-mono text-xs font-semibold"><Globe size={14}/> OID: {patient.oid}</span>}
                </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground mt-2">
                <span>{patient.age} years old</span>
                <span>{patient.gender}</span>
                <span>{patient.phone}</span>
              </div>
              {patient.condition && (
                <div className="mt-2">
                   <span className="text-sm font-medium">Primary Condition: </span>
                   <span className="text-sm">{patient.condition}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Edit size={16} /> Edit Profile</Button>
              <Button className="bg-ayurveda-green hover:bg-ayurveda-green/90"><Plus size={16} /> New Visit</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Calendar size={20} />} 
          label="Last Visit" 
          value={lastVisit ? format(lastVisit, 'dd MMM, yyyy') : 'N/A'}
        />
        <StatCard 
          icon={<Stethoscope size={20} />} 
          label="Total Visits" 
          value={visits.length}
        />
        <StatCard 
          icon={<DollarSign size={20} />} 
          label="Lifetime Value" 
          value={`₹${lifetimeValue.toLocaleString()}`}
        />
        <StatCard 
          icon={<Heart size={20} />} 
          label="Member Since" 
          value={formatDistanceToNow(memberSince, { addSuffix: true })}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="reports">Lab Reports</TabsTrigger>
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab profileData={profileData}/>
        </TabsContent>
        <TabsContent value="visits">
          <VisitsTab visits={visits} />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab invoices={invoices} />
        </TabsContent>
         <TabsContent value="reports">
          <ReportsTab reports={labReports} patientId={patient.id} />
        </TabsContent>
         <TabsContent value="cases">
          <CaseStudiesTab profileData={profileData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
