
'use client';

import React, { useState } from 'react';
import { Shield, QrCode, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const TwoFactorAuthDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      // In a real app, you'd check if the OTP is valid.
      // For this demo, we'll accept any 6-digit code.
      if (otp.length === 6) {
        toast({
          title: "Two-Factor Authentication Enabled",
          description: "Your account is now more secure.",
          variant: "default",
        });
        onConfirm();
      } else {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid 6-digit code.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the code below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 text-center">
          <div className="flex justify-center">
            <Image
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/OPDO:drsharmaji@oshadham.com?secret=JBSWY3DPEHPK3PXP&issuer=OPDO"
              alt="2FA QR Code"
              width={180}
              height={180}
              className="border p-2 rounded-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground">Or enter this code manually: <br /><span className="font-mono">JBSW Y3DP EHPK 3PXP</span></p>

          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={isVerifying || otp.length < 6}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SecurityTab = () => {
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [is2faDialogOpen, setIs2faDialogOpen] = useState(false);

  const handle2faToggle = (checked: boolean) => {
    if (checked) {
      // If turning on, show the setup dialog
      setIs2faDialogOpen(true);
    } else {
      // If turning off, just update the state (in a real app, this would require confirmation)
      setIs2faEnabled(false);
    }
  };

  const handle2faConfirm = () => {
    setIs2faEnabled(true);
    setIs2faDialogOpen(false);
  };
  
  const handle2faDialogClose = () => {
    // If the user closes the dialog without confirming, ensure the switch is off
    if (!is2faEnabled) {
      setIs2faDialogOpen(false);
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and data protection preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Password Management</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-medium">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                    id="enable-2fa" 
                    checked={is2faEnabled}
                    onCheckedChange={handle2faToggle}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">Current Session</h4>
                    <p className="text-sm text-muted-foreground">Bangalore, India • Chrome • May 5, 2025</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                Sign Out of All Other Devices
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Data Protection</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-medium">Auto-lock after inactivity</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lock screen after a period of inactivity
                  </p>
                </div>
                <Input type="number" defaultValue="15" className="w-20" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-medium">Data Encryption</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable end-to-end encryption for sensitive patient data
                  </p>
                </div>
                <Switch id="data-encryption" defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

       <TwoFactorAuthDialog 
        isOpen={is2faDialogOpen} 
        onClose={handle2faDialogClose}
        onConfirm={handle2faConfirm}
      />
    </>
  );
};

export default SecurityTab;
