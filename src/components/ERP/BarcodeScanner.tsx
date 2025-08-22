
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { AlertCircle, VideoOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      codeReaderRef.current = new BrowserMultiFormatReader();
      setError(null);

      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            codeReaderRef.current?.decodeFromStream(stream, videoRef.current, (result, err) => {
              if (result) {
                onScan(result.getText());
                onClose();
              }
              if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
                  console.error('Barcode scanning error:', err);
                  setError("An unexpected error occurred with the camera scanner.");
                  onClose();
              }
            });
          }
        } catch (err) {
          console.error('Camera access error:', err);
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission was denied. Please enable it in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found. Please connect a camera to use this feature.');
            } else {
                setError('Could not start camera. Please ensure it is not in use by another application.');
            }
          }
        }
      };

      startCamera();

    } else {
      // Cleanup when the dialog is closed
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    }

    return () => {
      // General cleanup on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
       if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [isOpen, onScan, onClose, toast]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>Point your camera at a product barcode.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
              <VideoOff size={48} className="text-destructive mb-4" />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <video ref={videoRef} className="w-full h-full" autoPlay playsInline />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
