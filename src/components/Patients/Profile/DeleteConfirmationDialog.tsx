
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => Promise<void>;
  resourceName: string;
  resourceType: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  resourceName,
  resourceType,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const correctText = 'DELETE';
  const isMatch = confirmationText === correctText;

  useEffect(() => {
    // Reset state when dialog opens
    if (isOpen) {
      setConfirmationText('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirmClick = async () => {
    if (!isMatch) return;
    setIsDeleting(true);
    await onConfirm();
    // No need to set isDeleting to false here as the component will unmount on success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive" />
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the {resourceType}{' '}
            <span className="font-bold">{resourceName}</span> and all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="delete-confirm">
            Please type <span className="font-bold text-destructive">{correctText}</span> to confirm.
          </Label>
          <Input
            id="delete-confirm"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmClick}
            disabled={!isMatch || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'I understand, delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
