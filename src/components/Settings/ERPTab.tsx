
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentNumberingTab from './ERP/DocumentNumberingTab';
import TaxesTab from './ERP/TaxesTab';
import InventorySettingsTab from './ERP/InventorySettingsTab';
import BillingSettingsTab from './ERP/BillingSettingsTab';

interface ERPTabProps {
    setSubmitHandler: (handler: (() => Promise<void>) | null) => void;
}

const ERPTab: React.FC<ERPTabProps> = ({ setSubmitHandler }) => {
  const [activeTab, setActiveTab] = React.useState("numbering");

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'numbering':
        return <DocumentNumberingTab setSubmitHandler={setSubmitHandler} />;
      case 'taxes':
        return <TaxesTab setSubmitHandler={setSubmitHandler} />;
      case 'inventory':
        return <InventorySettingsTab setSubmitHandler={setSubmitHandler} />;
      case 'billing':
        return <BillingSettingsTab setSubmitHandler={setSubmitHandler} />;
      default:
        return null;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="numbering">Document Numbering</TabsTrigger>
        <TabsTrigger value="taxes">Tax Settings</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-0">
        {renderActiveTab()}
      </TabsContent>
    </Tabs>
  );
};

export default ERPTab;
