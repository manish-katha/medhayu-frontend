
import React from 'react';
import { Database, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DataManagementTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={18} />
          Data Management
        </CardTitle>
        <CardDescription>
          Configure how your data is stored, backed up, and archived
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Automatic Backups</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Enable Automatic Backups</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Regularly back up your clinic data
                </p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-retention">Backup Retention</Label>
              <Select defaultValue="90">
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Cloud Backup</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Store backups in the cloud for added security
                </p>
              </div>
              <Switch id="cloud-backup" defaultChecked />
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Download size={16} className="mr-2" />
              Download Latest Backup
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Data Archiving</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Auto-archive Inactive Patients</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Archive patient records after period of inactivity
                </p>
              </div>
              <Switch id="auto-archive" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="archive-period">Archive After</Label>
              <Select defaultValue="2-years">
                <SelectTrigger id="archive-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-year">1 year inactivity</SelectItem>
                  <SelectItem value="2-years">2 years inactivity</SelectItem>
                  <SelectItem value="3-years">3 years inactivity</SelectItem>
                  <SelectItem value="5-years">5 years inactivity</SelectItem>
                  <SelectItem value="never">Never archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Data Export</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your clinic data in various formats for external use
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download size={16} className="mr-2" />
                Export Patient Data (CSV)
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download size={16} className="mr-2" />
                Export Patient Data (Excel)
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download size={16} className="mr-2" />
                Export Appointment History
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download size={16} className="mr-2" />
                Export Prescription Records
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementTab;
