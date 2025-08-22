import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataManagementTab from './Advanced/DataManagementTab';
import SystemPreferencesTab from './Advanced/SystemPreferencesTab';
import IntegrationTab from './Advanced/IntegrationTab';
import WearableSettingsTab from './Advanced/WearableSettingsTab';
import MobileIntegrationTab from './Advanced/MobileIntegrationTab';
import BluetoothSettingsTab from './Advanced/BluetoothSettingsTab';

const AdvancedTab = () => {
  return (
    <Tabs defaultValue="data-management">
      <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 mb-6">
        <TabsTrigger value="data-management">Data Management</TabsTrigger>
        <TabsTrigger value="system-preferences">System Preferences</TabsTrigger>
        <TabsTrigger value="integration">Integration</TabsTrigger>
        <TabsTrigger value="wearable">Wearable Settings</TabsTrigger>
        <TabsTrigger value="mobile">Mobile Companion</TabsTrigger>
        <TabsTrigger value="bluetooth">Bluetooth</TabsTrigger>
      </TabsList>

      <TabsContent value="data-management">
        <DataManagementTab />
      </TabsContent>
      
      <TabsContent value="system-preferences">
        <SystemPreferencesTab />
      </TabsContent>
      
      <TabsContent value="integration">
        <IntegrationTab />
      </TabsContent>
      
      <TabsContent value="wearable">
        <WearableSettingsTab />
      </TabsContent>

      <TabsContent value="mobile">
        <MobileIntegrationTab />
      </TabsContent>
       <TabsContent value="bluetooth">
        <BluetoothSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdvancedTab;
