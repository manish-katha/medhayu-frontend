
'use client';

import React, { useState } from 'react';
import { ClipboardList, Key, Settings, Link as LinkIcon, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ title, icon, enabled, onToggle, children }) => (
  <div className="flex items-start gap-4 p-4 border rounded-lg">
    <div className="bg-muted p-3 rounded-full">{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div className={cn("mt-4 space-y-4 transition-all", !enabled && "opacity-50 pointer-events-none")}>
        {children}
      </div>
    </div>
  </div>
);

const IntegrationTab = () => {
  const { toast } = useToast();
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [paytmEnabled, setPaytmEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [gmailEnabled, setGmailEnabled] = useState(false);
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(true);

  const handleSave = (serviceName: string) => {
    toast({
      title: "Settings Saved",
      description: `${serviceName} integration settings have been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Connect with payment providers to accept online payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationCard
            title="Razorpay"
            icon={<Key className="text-blue-500" />}
            enabled={razorpayEnabled}
            onToggle={setRazorpayEnabled}
          >
            <div className="space-y-2">
              <Label htmlFor="razorpay-key-id">Key ID</Label>
              <Input id="razorpay-key-id" placeholder="rzp_live_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpay-key-secret">Key Secret</Label>
              <Input id="razorpay-key-secret" type="password" placeholder="••••••••••••••••••••" />
            </div>
            <Button size="sm" variant="outline" onClick={() => handleSave('Razorpay')}>Save Razorpay Settings</Button>
          </IntegrationCard>

           <IntegrationCard
            title="PayTM"
            icon={<Key className="text-sky-500" />}
            enabled={paytmEnabled}
            onToggle={setPaytmEnabled}
          >
            <div className="space-y-2">
              <Label htmlFor="paytm-mid">Merchant ID (MID)</Label>
              <Input id="paytm-mid" placeholder="Enter your Merchant ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paytm-mkey">Merchant Key</Label>
              <Input id="paytm-mkey" type="password" placeholder="••••••••••••••••••••" />
            </div>
             <Button size="sm" variant="outline" onClick={() => handleSave('PayTM')}>Save PayTM Settings</Button>
          </IntegrationCard>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Communication Services</CardTitle>
          <CardDescription>Manage integrations for sending notifications and reminders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <IntegrationCard
            title="WhatsApp Business API"
            icon={<Key className="text-green-500" />}
            enabled={whatsappEnabled}
            onToggle={setWhatsappEnabled}
          >
            <div className="space-y-2">
              <Label htmlFor="whatsapp-api-key">API Key</Label>
              <Input id="whatsapp-api-key" placeholder="Enter your WhatsApp API Key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone-id">Phone Number ID</Label>
              <Input id="whatsapp-phone-id" placeholder="Enter your Phone Number ID" />
            </div>
            <Button size="sm" variant="outline" onClick={() => handleSave('WhatsApp')}>Save WhatsApp Settings</Button>
          </IntegrationCard>

           <IntegrationCard
            title="Gmail (via OAuth)"
            icon={<LinkIcon className="text-red-500" />}
            enabled={gmailEnabled}
            onToggle={setGmailEnabled}
          >
            <p className="text-sm text-muted-foreground">Connect your Google account to send emails directly from Gmail. This requires authorizing OPDO to access your Gmail account.</p>
            <Button size="sm" variant="outline" onClick={() => handleSave('Gmail')}>Connect Google Account</Button>
          </IntegrationCard>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar & Scheduling</CardTitle>
          <CardDescription>Sync your appointments with external calendar services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <IntegrationCard
            title="Google Calendar"
            icon={<LinkIcon className="text-yellow-500" />}
            enabled={googleCalendarEnabled}
            onToggle={setGoogleCalendarEnabled}
          >
            <p className="text-sm text-muted-foreground">Connect your Google Calendar to automatically sync appointments and receive notifications.</p>
            <Button size="sm" variant="outline" onClick={() => handleSave('Google Calendar')}>Connect Google Calendar</Button>
          </IntegrationCard>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTab;
