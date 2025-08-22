
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BranchManagementTab = () => {
  const [branchesEnabled, setBranchesEnabled] = useState(true);
  const [singleGstMode, setSingleGstMode] = useState(true);
  
  return (
    <div className="space-y-6">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Branch Management</CardTitle>
          <CardDescription>
            Configure multi-location and branch settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-branches" className="block font-medium">Enable Multiple Branches</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow management of multiple clinic locations
              </p>
            </div>
            <Switch 
              id="enable-branches" 
              checked={branchesEnabled}
              onCheckedChange={setBranchesEnabled}
            />
          </div>
          
          {branchesEnabled && (
            <div className="space-y-4 pl-6 mt-2 pt-2 border-l">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gst-mode" className="block font-medium">GST Configuration</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose how GST numbers are managed across branches
                  </p>
                </div>
                <Select 
                  value={singleGstMode ? "single" : "multiple"} 
                  onValueChange={(value) => setSingleGstMode(value === "single")}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single GST for all branches</SelectItem>
                    <SelectItem value="multiple">Branch-specific GST numbers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="branch-inventory" className="block font-medium">Branch Inventory System</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Each branch manages its own inventory separately
                  </p>
                </div>
                <Switch id="branch-inventory" defaultChecked />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchManagementTab;
