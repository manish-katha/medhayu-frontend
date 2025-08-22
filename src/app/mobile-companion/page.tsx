
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Barcode, Camera, Wifi, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { getDatabase, ref, onValue, set, off, onDisconnect, goOffline, goOnline } from "firebase/database";
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const MobileCompanionContent = () => {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const [activeAction, setActiveAction] = useState<'scan' | 'photo' | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setIsConnecting(false);
            return;
        }

        // Store session ID in localStorage for persistence
        localStorage.setItem('opdo-session-id', sessionId);

        const db = getDatabase(app);
        goOnline(db); // Ensure connection is active

        const statusRef = ref(db, `sessions/${sessionId}/status`);
        const commandRef = ref(db, `sessions/${sessionId}/command`);
        
        set(statusRef, 'connected');
        onDisconnect(statusRef).set('disconnected');
        
        setIsConnecting(false);

        const handleCommand = (snapshot: any) => {
            const command = snapshot.val();
            if (command?.action === 'SCAN_BARCODE') {
                setActiveAction('scan');
            } else if (command?.action === 'TAKE_PHOTO') {
                setActiveAction('photo');
            }
        };

        const unsubscribe = onValue(commandRef, handleCommand);

        // Cleanup on unmount
        return () => {
            off(commandRef, 'value', handleCommand);
            set(statusRef, 'disconnected');
            goOffline(db);
        };
    }, [sessionId]);


    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        // Clear the command from firebase after stopping
        if (sessionId) {
            const db = getDatabase(app);
            const commandRef = ref(db, `sessions/${sessionId}/command`);
            set(commandRef, null);
        }
    };

    useEffect(() => {
        const startCameraAndAction = async () => {
            if (!activeAction) {
                stopCamera();
                return;
            }

            try {
                const facingMode = activeAction === 'scan' ? 'environment' : 'user';
                const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
                streamRef.current = newStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                    await videoRef.current.play();
                }

                if (activeAction === 'scan') {
                    codeReaderRef.current = new BrowserMultiFormatReader();
                    codeReaderRef.current.decodeFromStream(newStream, videoRef.current!, (result, err) => {
                        if (result) {
                            sendDataToDesktop({ type: 'barcode', data: result.getText() });
                            setActiveAction(null);
                        }
                        if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
                            console.error('Barcode scanning error:', err);
                            toast({ title: "Scanner Error", variant: "destructive" });
                            setActiveAction(null);
                        }
                    });
                }
            } catch (error) {
                console.error("Camera Error:", error);
                toast({ title: "Camera Error", description: "Could not access camera. Please check permissions.", variant: "destructive" });
                setActiveAction(null);
            }
        };

        startCameraAndAction();
        
        return () => {
            stopCamera();
        };

    }, [activeAction, toast]);
    

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            sendDataToDesktop({ type: 'photo', data: dataUrl });
            setActiveAction(null);
        }
    };
    
    const sendDataToDesktop = (data: { type: 'barcode' | 'photo', data: string }) => {
        if (!sessionId) return;
        const db = getDatabase(app);
        const resultRef = ref(db, `sessions/${sessionId}/result`);
        set(resultRef, data);
        toast({ title: "Data Sent", description: `Sent ${data.type} to desktop.` });
    };

    if (activeAction) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center items-center gap-4">
                    {activeAction === 'photo' && (
                        <Button className="h-16 w-16 rounded-full" onClick={handleCapturePhoto}>
                            <Camera size={32} />
                        </Button>
                    )}
                    <Button variant="destructive" className="h-16 w-16 rounded-full" onClick={() => setActiveAction(null)}>
                        <X size={32} />
                    </Button>
                </div>
                 {activeAction === 'scan' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/3 border-4 border-dashed border-white/50 rounded-lg"/>
                 )}
            </div>
        );
    }
    
    if (isConnecting) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <Loader2 className="h-14 w-14 mx-auto animate-spin text-ayurveda-green mb-4"/>
                        <CardTitle>Connecting...</CardTitle>
                        <CardDescription>Attempting to connect to the OPDO desktop session.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!sessionId) {
         return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Connection Error</CardTitle>
                        <CardDescription>
                            No session ID found. Please scan the QR code from the OPDO settings on your desktop to connect your device.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-ayurveda-green text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <Wifi size={32} />
                </div>
                <CardTitle>OPDO Companion</CardTitle>
                <CardDescription>Your device is connected and listening for commands from the desktop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-center text-muted-foreground">
                    You can leave this page open. Actions on your desktop will automatically trigger the camera on this device.
                </p>
            </CardContent>
        </Card>
    </div>
  );
};


export default function MobileCompanionPage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <MobileCompanionContent />
        </Suspense>
    );
}
