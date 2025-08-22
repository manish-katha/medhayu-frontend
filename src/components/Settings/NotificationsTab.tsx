
import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const NotificationsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={18} />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how you want to receive alerts and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Appointment Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-appointment" className="flex-grow">New appointment booking</Label>
              <Switch id="new-appointment" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment-reminder" className="flex-grow">Appointment reminders (2 hours before)</Label>
              <Switch id="appointment-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cancelled-appointment" className="flex-grow">Cancelled appointments</Label>
              <Switch id="cancelled-appointment" defaultChecked />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Patient Communications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="patient-message" className="flex-grow">New messages from patients</Label>
              <Switch id="patient-message" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="patient-followup" className="flex-grow">Follow-up reminders</Label>
              <Switch id="patient-followup" defaultChecked />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Inventory Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="low-stock" className="flex-grow">Low stock alerts</Label>
              <Switch id="low-stock" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expiry-alert" className="flex-grow">Medicine expiry alerts</Label>
              <Switch id="expiry-alert" defaultChecked />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Communication Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-grow">Email notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications" className="flex-grow">SMS notifications</Label>
              <Switch id="sms-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="app-notifications" className="flex-grow">In-app notifications</Label>
              <Switch id="app-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp-notifications" className="flex-grow">WhatsApp notifications</Label>
              <Switch id="whatsapp-notifications" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
