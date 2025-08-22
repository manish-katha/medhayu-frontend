
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCcw, Save } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CameraCaptureProps {
  onSave: (photoDataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onSave }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = cameraStream;
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = () => {
    if (capturedImage) {
      onSave(capturedImage);
    }
  };

  if (hasCameraPermission === false) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Camera Access Required</AlertTitle>
        <AlertDescription>
          Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} className="w-full h-full" autoPlay muted playsInline />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex justify-center gap-4">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={handleRetake}>
              <RefreshCcw className="mr-2" />
              Retake Photo
            </Button>
            <Button onClick={handleSave} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
              <Save className="mr-2" />
              Save Photo
            </Button>
          </>
        ) : (
          <Button onClick={handleCapture} disabled={!hasCameraPermission}>
            <Camera className="mr-2" />
            Capture Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
