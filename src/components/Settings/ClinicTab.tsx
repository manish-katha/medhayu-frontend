
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClinicDetailsTab from './Clinic/ClinicDetailsTab';
import PrescriptionTab from './Clinic/PrescriptionTab';
import BranchManagementTab from './Clinic/BranchManagementTab';
import PatientDataTab from './Clinic/PatientDataTab';
import TeamAndRolesTab from './Clinic/TeamAndRolesTab';

interface ClinicTabProps {
    setSubmitHandler?: (handler: (() => Promise<void>) | null) => void;
}

const ClinicTab: React.FC<ClinicTabProps> = ({ setSubmitHandler }) => {
  const [activeTab, setActiveTab] = React.useState("details");

  // A bit of a hack to pass down the correct submit handler for the active tab
  // This could be managed with context for a larger app.
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'patient-data':
        return <PatientDataTab setSubmitHandler={setSubmitHandler} />;
      case 'details':
        return <ClinicDetailsTab />;
      case 'prescription':
        return <PrescriptionTab />;
      case 'branches':
        return <BranchManagementTab />;
      case 'team':
        return <TeamAndRolesTab />;
      default:
        return null;
    }
  }


  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="details">Clinic Details</TabsTrigger>
        <TabsTrigger value="prescription">Prescription Pad</TabsTrigger>
        <TabsTrigger value="branches">Branch Management</TabsTrigger>
        <TabsTrigger value="patient-data">Patient Data</TabsTrigger>
        <TabsTrigger value="team">Team & Roles</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>
        {renderActiveTab()}
      </TabsContent>
    </Tabs>
  );
};

export default ClinicTab;
