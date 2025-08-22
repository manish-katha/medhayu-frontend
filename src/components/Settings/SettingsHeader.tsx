
import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  saving: boolean;
  onSave: () => void;
}

const SettingsHeader = ({ saving, onSave }: SettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ayurveda-green">Settings</h1>
        <p className="text-muted-foreground">Configure your clinic preferences and system settings</p>
      </div>
      <Button 
        variant="default" 
        className="bg-ayurveda-green hover:bg-ayurveda-green/90"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
          <>
            <Save size={16} className="mr-2" />
            Save Settings
          </>
        }
      </Button>
    </div>
  );
};

export default SettingsHeader;
