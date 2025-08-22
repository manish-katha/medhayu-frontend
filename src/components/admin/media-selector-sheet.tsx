
'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { getMediaFiles } from '@/services/media.service';
import { MediaUploader } from './media-uploader';

interface MediaSelectorSheetProps {
  children: React.ReactNode;
  onSelectImage: (url: string) => void;
}

export function MediaSelectorSheet({ children, onSelectImage }: MediaSelectorSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const fetchMedia = () => getMediaFiles().then(setMediaFiles);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const handleSelect = (url: string) => {
    onSelectImage(url);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Select Media</SheetTitle>
          <SheetDescription>Choose an image from your library or upload a new one.</SheetDescription>
        </SheetHeader>
        <div className="p-4 border-y">
          <MediaUploader showCard={false} onUploadSuccess={fetchMedia} />
        </div>
        <ScrollArea className="flex-1 mt-4">
          {mediaFiles.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 pr-6">
              {mediaFiles.map((fileUrl) => (
                <button
                  key={fileUrl}
                  className="relative aspect-square overflow-hidden rounded-md border group focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => handleSelect(fileUrl)}
                >
                  <Image
                    src={fileUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No images in library.</p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
