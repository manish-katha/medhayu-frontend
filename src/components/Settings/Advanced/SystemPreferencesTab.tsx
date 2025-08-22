
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const SystemPreferencesTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon size={18} />
          System Preferences
        </CardTitle>
        <CardDescription>
          Configure system-wide settings and default behaviors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Date and Time</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select defaultValue="12hr">
                <SelectTrigger id="time-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12hr">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24hr">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="asia-kolkata">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                  <SelectItem value="asia-dubai">Asia/Dubai (GMT+4:00)</SelectItem>
                  <SelectItem value="asia-singapore">Asia/Singapore (GMT+8:00)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (GMT+0:00)</SelectItem>
                  <SelectItem value="america-newyork">America/New York (GMT-5:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Language & Localization</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-language">Primary Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="primary-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="sa">Sanskrit</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="ml">Malayalam</SelectItem>
                  <SelectItem value="kn">Kannada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Show Sanskrit Terms</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Display Sanskrit equivalents for Ayurvedic terminology
                </p>
              </div>
              <Switch id="sanskrit-terms" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Use Traditional Measurements</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Display weights and measures in traditional Ayurvedic units
                </p>
              </div>
              <Switch id="traditional-units" defaultChecked />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Enable Animations</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Toggle UI animations and transitions
                </p>
              </div>
              <Switch id="enable-animations" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Cache Patient Data</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Store frequent patient data locally for faster access
                </p>
              </div>
              <Switch id="cache-data" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patient-list-size">Patients Per Page</Label>
              <Select defaultValue="15">
                <SelectTrigger id="patient-list-size">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemPreferencesTab;
