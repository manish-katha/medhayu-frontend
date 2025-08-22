import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Users, User, Shield } from 'lucide-react';

const TeamAndRolesTab = () => {
  const [isTeamMode, setIsTeamMode] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={18} />
          Team & Roles
        </CardTitle>
        <CardDescription>
          Manage user access and permissions for your clinic staff.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Practice Mode</h3>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                {isTeamMode ? <Users size={16} /> : <User size={16} />}
                {isTeamMode ? 'Team Mode' : 'Solo Doctor Mode'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isTeamMode
                  ? "Allows front office staff to book appointments and manage patient records."
                  : "Optimized for a single doctor managing all clinic operations."}
              </p>
            </div>
            <Switch
              checked={isTeamMode}
              onCheckedChange={setIsTeamMode}
              aria-label="Toggle practice mode"
            />
          </div>
        </div>

        {isTeamMode && (
           <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Team Members</h3>
             <p className="text-sm text-muted-foreground">
                (Feature coming soon) Invite and manage roles for your front office, junior doctors, and other staff members.
             </p>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamAndRolesTab;
