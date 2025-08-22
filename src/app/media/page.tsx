
'use client';

import { getMediaFiles } from '@/services/media.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { MediaUploader } from '@/components/admin/media-uploader';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function MediaPage() {
    const [mediaFiles, setMediaFiles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    
    const fetchMedia = useCallback(() => {
        setIsLoading(true);
        getMediaFiles().then(files => {
            setMediaFiles(files);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUploadSuccess = () => {
        setIsUploadDialogOpen(false);
        fetchMedia(); // Refresh the list
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Media Library</h1>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Available Images</CardTitle>
                    <CardDescription>
                    These images are available to be inserted into your articles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-md" />
                            ))}
                        </div>
                    ) : mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mediaFiles.map((fileUrl) => (
                                <div key={fileUrl} className="relative aspect-square overflow-hidden rounded-md border">
                                    <Image
                                        src={fileUrl}
                                        alt={`Media image ${fileUrl}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                            <p className="mb-2">Your Media Library is empty.</p>
                            <p className="text-sm">Click the upload button to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed z-10 bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
                        aria-label="Upload Image"
                    >
                        <Upload className="h-8 w-8" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload New Image</DialogTitle>
                        <DialogDescription>
                            Select an image file from your computer to add it to the library.
                        </DialogDescription>
                    </DialogHeader>
                    <MediaUploader showCard={false} onUploadSuccess={handleUploadSuccess} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
