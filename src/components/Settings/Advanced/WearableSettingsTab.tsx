
import React, { useState } from 'react';
import { Watch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const WearableSettingsTab = () => {
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [calendarReminders, setCalendarReminders] = useState(true);
  const [seasonAlerts, setSeasonAlerts] = useState(true);
  const [routineReminders, setRoutineReminders] = useState(true);
  const [medicineAlerts, setMedicineAlerts] = useState(true);
  const [liveNatureMode, setLiveNatureMode] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Watch size={18} />
          Wearable Settings
        </CardTitle>
        <CardDescription>
          Configure integration with wearable devices for patient monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Wearable Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sync-calendar" className="block font-medium">Sync Calendar</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Synchronize appointments with wearable devices
                </p>
              </div>
              <Switch 
                id="sync-calendar" 
                checked={syncCalendar}
                onCheckedChange={setSyncCalendar}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="calendar-reminders" className="block font-medium">Send Calendar Reminders</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Send appointment reminders to wearable devices
                </p>
              </div>
              <Switch 
                id="calendar-reminders" 
                checked={calendarReminders}
                onCheckedChange={setCalendarReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="season-alerts" className="block font-medium">Send Alerts for Season</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Notify about seasonal dietary and lifestyle changes
                </p>
              </div>
              <Switch 
                id="season-alerts" 
                checked={seasonAlerts}
                onCheckedChange={setSeasonAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="routine-reminders" className="block font-medium">Send Routine Reminders</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Daily reminders for dinacharya (daily routine)
                </p>
              </div>
              <Switch 
                id="routine-reminders" 
                checked={routineReminders}
                onCheckedChange={setRoutineReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="medicine-alerts" className="block font-medium">Medicine Alert</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Reminders to take prescribed medicines
                </p>
              </div>
              <Switch 
                id="medicine-alerts" 
                checked={medicineAlerts}
                onCheckedChange={setMedicineAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="live-nature-mode" className="block font-medium">Live the Nature Mode</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Align notifications with natural rhythms and cycles
                </p>
              </div>
              <Switch 
                id="live-nature-mode" 
                checked={liveNatureMode}
                onCheckedChange={setLiveNatureMode}
              />
            </div>
            
            {liveNatureMode && (
              <div className="space-y-4 pl-6 mt-2 pt-2 border-l">
                <div className="space-y-2">
                  <Label htmlFor="rhythm-type">Natural Rhythm Type</Label>
                  <Select defaultValue="circadian">
                    <SelectTrigger id="rhythm-type">
                      <SelectValue placeholder="Select rhythm type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circadian">Circadian Rhythm (Daily)</SelectItem>
                      <SelectItem value="lunar">Lunar Cycles (Monthly)</SelectItem>
                      <SelectItem value="seasonal">Seasonal Cycles (Yearly)</SelectItem>
                      <SelectItem value="complete">Complete Natural Integration</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Type of natural rhythm to synchronize with
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="location-based" defaultChecked />
                  <Label htmlFor="location-based">Enable location-based adjustments</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="dosha-based" defaultChecked />
                  <Label htmlFor="dosha-based">Personalize based on dominant dosha</Label>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Compatible Devices</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-700 font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-medium">Apple Watch</h4>
                  <p className="text-sm text-muted-foreground">iOS compatible</p>
                </div>
              </div>
              <Switch id="apple-watch" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-700 font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-medium">Samsung Galaxy Watch</h4>
                  <p className="text-sm text-muted-foreground">Android compatible</p>
                </div>
              </div>
              <Switch id="samsung-watch" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">F</span>
                </div>
                <div>
                  <h4 className="font-medium">Fitbit</h4>
                  <p className="text-sm text-muted-foreground">Cross-platform compatible</p>
                </div>
              </div>
              <Switch id="fitbit" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-700 font-bold">G</span>
                </div>
                <div>
                  <h4 className="font-medium">Garmin</h4>
                  <p className="text-sm text-muted-foreground">Cross-platform compatible</p>
                </div>
              </div>
              <Switch id="garmin" />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Health Data Collection</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Collect health data from wearable devices
                </p>
              </div>
              <Switch id="health-data-collection" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Activity Tracking</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Track physical activity and exercise
                </p>
              </div>
              <Switch id="activity-tracking" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="block font-medium">Sleep Monitoring</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor sleep patterns for health insights
                </p>
              </div>
              <Switch id="sleep-monitoring" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WearableSettingsTab;
