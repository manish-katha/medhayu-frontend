
'use client';

import React, { useState, useEffect } from 'react';
import { Bluetooth, BluetoothConnected, BluetoothSearching, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BluetoothSettingsTab = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      navigator.bluetooth.getAvailability().then(available => {
        setIsSupported(available);
      });
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleBluetoothScan = async () => {
    if (!isSupported) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser or device does not support the Web Bluetooth API.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      setConnectedDevice(device);
      toast({
        title: "Device Connected",
        description: `Successfully connected to ${device.name || 'Unnamed Device'}.`,
      });
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
             toast({
                title: 'No Devices Found',
                description: 'No Bluetooth devices were found. Make sure your device is discoverable.',
                variant: 'destructive',
            });
        } else if (error.name === 'SecurityError') {
             toast({
                title: 'Connection Failed',
                description: 'Connection failed due to a security policy. See console for details.',
                variant: 'destructive',
            });
        }
        else {
             toast({
                title: 'Bluetooth Scan Cancelled',
                description: 'The device selection was cancelled.',
                variant: 'destructive',
            });
        }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth size={18} />
          Bluetooth Device Integration
        </CardTitle>
        <CardDescription>
          Connect directly to Bluetooth-enabled peripherals like barcode scanners or medical sensors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSupported === false && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Bluetooth Not Available</AlertTitle>
                <AlertDescription>
                   Web Bluetooth is blocked or not supported in this browser. Please ensure you are using a compatible browser (like Chrome or Edge) and that the server has the correct `Permissions-Policy` header.
                </AlertDescription>
            </Alert>
        )}
        
        <div className="p-4 border rounded-md bg-muted/30 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Connected Device</h3>
                {connectedDevice ? (
                     <Badge variant="success" className="text-base">
                        <BluetoothConnected className="mr-2" />
                        {connectedDevice.name || 'Unnamed Device'}
                    </Badge>
                ) : (
                    <Badge variant="outline">None</Badge>
                )}
            </div>
             <Button
                onClick={handleBluetoothScan}
                disabled={isScanning || isSupported === false}
                className="w-full"
            >
                {isScanning ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</>
                ) : (
                    <><BluetoothSearching className="mr-2" />Scan for Bluetooth Devices</>
                )}
            </Button>
        </div>
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
                This feature uses the Web Bluetooth API to connect to devices directly from your browser. This requires a secure (HTTPS) connection and a browser that supports it, like Google Chrome or Microsoft Edge.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BluetoothSettingsTab;
