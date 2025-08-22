
'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// This should be a unique ID for the clinic/user session
const SESSION_ID = "clinic-session-1";

const MobileIntegrationTab = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const companionUrl = `${window.location.origin}/mobile-companion?sessionId=${SESSION_ID}`;
      const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(companionUrl)}`;
      setQrCodeUrl(generatedQrUrl);

      const db = getDatabase(app);
      const statusRef = ref(db, `sessions/${SESSION_ID}/status`);
      
      const listener = onValue(statusRef, (snapshot) => {
        const connected = snapshot.val() === 'connected';
        if (connected !== isDeviceConnected) {
            setIsDeviceConnected(connected);
            if(connected) {
              toast({
                  title: "Mobile Device Connected",
                  description: "Your mobile is now ready to use as a camera or scanner.",
                  variant: "default",
              });
            }
        }
      });
      
      return () => off(statusRef, 'value', listener);
    }
  }, [isDeviceConnected, toast]);


  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Smartphone size={18} />
            Mobile Companion Connect
            </CardTitle>
            <CardDescription>
            Connect your mobile phone via Wi-Fi to use it as a barcode scanner or for patient photos by scanning a QR code.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center p-4 border rounded-lg bg-muted/30">
                <div className="flex-shrink-0">
                    {qrCodeUrl ? (
                        <Image
                            src={qrCodeUrl}
                            alt="QR Code to connect mobile"
                            width={150}
                            height={150}
                            className="rounded-md"
                        />
                    ) : (
                        <Skeleton className="w-[150px] h-[150px] rounded-md" />
                    )}
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">1. Scan to Connect</h3>
                    <p className="text-sm text-muted-foreground">
                        Use your mobile phone's camera to scan the QR code. This will open the OPDO Companion page in your mobile browser, linking it to this desktop session. Keep the page open on your mobile to maintain the connection.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg">2. Connection Status</h3>
                <div className="mt-2 p-4 border rounded-md bg-muted/30 text-center">
                    {isDeviceConnected ? (
                        <Badge variant="success" className="text-base px-4 py-2">
                            <Wifi className="mr-2" />
                            Mobile Device Connected
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="text-base px-4 py-2">
                            <WifiOff className="mr-2" />
                            No Mobile Device Connected
                        </Badge>
                    )}
                     <p className="text-xs text-muted-foreground mt-2">
                        The status will update automatically once you scan the QR code and open the page.
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default MobileIntegrationTab;
