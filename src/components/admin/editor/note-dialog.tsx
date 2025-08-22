
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: string;
  onSave: (content: string) => void;
}

export function NoteDialog({ isOpen, onOpenChange, noteType, onSave }: NoteDialogProps) {
  const [content, setContent] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {noteType === 'footnote' ? 'Footnote' : 'Special Note'}</DialogTitle>
          <DialogDescription>
            Enter the content for your note. It will be added at the cursor's position.
          </DialogDescription>
        </DialogHeader>
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content here..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(content); onOpenChange(false); setContent(''); }}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

