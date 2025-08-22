
'use client';

import React, { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveMediaFile } from '@/services/media.service';

interface MediaUploaderProps {
  onUploadSuccess?: () => void;
  showCard?: boolean;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Image
        </Button>
    )
}

export function MediaUploader({ onUploadSuccess, showCard = true }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const action = async (prevState: any, formData: FormData) => {
    const fileToUpload = formData.get('file') as File;
    if (!fileToUpload || fileToUpload.size === 0) {
        return { error: 'Please select a file to upload.' };
    }
    
    const result = await saveMediaFile(fileToUpload);

    if(result.success) {
        toast({ title: 'Upload Successful!', description: 'Your image has been added to the library.'});
        setFile(null);
        setPreview(null);
        if(onUploadSuccess) onUploadSuccess();
        return { success: true };
    } else {
        return { error: result.error };
    }
  }

  const [state, formAction] = useActionState(action, null);

  const uploaderContent = (
    <form action={formAction}>
        <div className="space-y-4">
            <div className="space-y-2">
                <Input id="file" name="file" type="file" onChange={handleFileChange} accept="image/*" />
            </div>
            {preview && (
                <div className="relative aspect-video w-full rounded-md border bg-muted">
                    <img src={preview} alt="Image preview" className="w-full h-full object-contain" />
                </div>
            )}
             {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </div>
    </form>
  );

  if (showCard) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon size={18} /> Upload Image</CardTitle>
                <CardDescription>Select an image to add to your media library.</CardDescription>
            </CardHeader>
            <CardContent>
                {uploaderContent}
            </CardContent>
        </Card>
    );
  }
  
  return uploaderContent;
}
