
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Leaf, Save } from 'lucide-react';
import { MediaSelectorSheet } from '@/components/admin/media-selector-sheet';
import Image from 'next/image';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addPost } from '@/services/post.service';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { EditorToolbar } from '@/components/admin/editor/toolbar';
import type { Editor } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import type { Circle } from '@/types';

const rasaOptions = ["Madhura", "Amla", "Lavana", "Katu", "Tikta", "Kashaya"].map(o => ({ value: o, label: o }));
const gunaOptions = ["Laghu", "Guru", "Ruksha", "Snigdha", "Ushna", "Sheeta", "Tikshna", "Manda"].map(o => ({ value: o, label: o }));
const veeryaOptions = ["Ushna", "Sheeta"];
const vipakaOptions = ["Madhura", "Katu", "Amla"];

interface DravyagunaPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
  userCircles: Circle[];
}

export function DravyagunaPostDialog({ open, onOpenChange, onPostCreated, userCircles }: DravyagunaPostDialogProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [discussionContent, setDiscussionContent] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('public');
  const [dravyaData, setDravyaData] = useState({
    name: '',
    botanicalName: '',
    rasa: [],
    guna: [],
    veerya: '',
    vipaka: '',
    prabhava: '',
    karma: '',
    partUsed: '',
    formulationUse: '',
  });

  const handleChange = (field: string, value: any) => {
    setDravyaData(prev => ({...prev, [field]: value}));
  }

  const handleCreatePost = async () => {
    if (!dravyaData.name || !dravyaData.botanicalName) {
        toast({ title: 'Name and Botanical Name are required.', variant: 'destructive'});
        return;
    }

    const newPost = {
        postType: 'dravyaguna' as const,
        author: { id: 'user1', name: 'Admin User', avatarUrl: '/media/_cce41b04-07a0-4c49-bd66-7d2b4a59f1a7.jpg' },
        content: discussionContent,
        dravyaData: { ...dravyaData, imageUrl, discussion: discussionContent },
        circleId: selectedCircle === 'public' ? undefined : selectedCircle,
    };
    
    await addPost(newPost);
    toast({ title: 'Post Created!', description: 'Your dravya post has been added to the wall.' });
    onPostCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Leaf /> Post about a Dravya (Drug)</DialogTitle>
          <DialogDescription>Share details about an Ayurvedic substance for the community.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <MediaSelectorSheet onSelectImage={setImageUrl}>
              <div className="aspect-square relative w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-primary">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Dravya image" layout="fill" objectFit="cover" className="rounded-md" />
                ) : (
                  <>
                    <Leaf size={48} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2 text-center">Click to upload or select an image</p>
                  </>
                )}
              </div>
            </MediaSelectorSheet>
             <div>
                <Label>Karma (Actions)</Label>
                <Input placeholder="Rasayana, Jwaraghna (comma-separated)" value={dravyaData.karma} onChange={e => handleChange('karma', e.target.value)} />
            </div>
             <div>
                <Label>Part Used</Label>
                <Input placeholder="Phala, Patra" value={dravyaData.partUsed} onChange={e => handleChange('partUsed', e.target.value)} />
            </div>
            <div>
                <Label>Formulation Use (Optional)</Label>
                <Input placeholder="Triphala, Chyawanprash" value={dravyaData.formulationUse} onChange={e => handleChange('formulationUse', e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dravya-name">Dravya Name</Label>
                <Input id="dravya-name" placeholder="Haritaki" value={dravyaData.name} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="botanical-name">Botanical Name</Label>
                <Input id="botanical-name" placeholder="Terminalia chebula" value={dravyaData.botanicalName} onChange={e => handleChange('botanicalName', e.target.value)} />
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Rasa (Taste)</Label>
                    <MultiSelect options={rasaOptions} placeholder="Select Rasa..." onSelectionChange={(val) => handleChange('rasa', val)} />
                </div>
                 <div>
                    <Label>Guna (Qualities)</Label>
                    <MultiSelect options={gunaOptions} placeholder="Select Guna..." onSelectionChange={(val) => handleChange('guna', val)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Veerya (Potency)</Label>
                    <Select onValueChange={(val) => handleChange('veerya', val)}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{veeryaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
                </div>
                 <div>
                    <Label>Vipaka (Post-digestive)</Label>
                    <Select onValueChange={(val) => handleChange('vipaka', val)}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{vipakaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
                </div>
            </div>
             <div>
                <Label>Prabhava</Label>
                <Input placeholder="Deepana, Medhya, etc." value={dravyaData.prabhava} onChange={e => handleChange('prabhava', e.target.value)} />
            </div>
            <Separator />
             <div>
                <Label>Discussion / Commentary</Label>
                <div className="border rounded-md mt-2 min-h-[200px]">
                    {editor && <EditorToolbar editor={editor} />}
                    <RichTextEditor
                        id="dravya-discussion"
                        content={discussionContent}
                        onChange={setDiscussionContent}
                        setEditorInstance={(id, instance) => setEditor(instance)}
                        removeEditorInstance={() => setEditor(null)}
                        placeholder="Share your insights about this dravya..."
                    />
                </div>
             </div>
          </div>
        </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t flex justify-between w-full">
          <Select value={selectedCircle} onValueChange={setSelectedCircle}>
              <SelectTrigger className="w-[180px]">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="public">Post to Public</SelectItem>
                  {userCircles.map(circle => (
                      <SelectItem key={circle.id} value={circle.id}>{circle.name}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} className="bg-ayurveda-green hover:bg-ayurveda-green/90">
                <Save className="mr-2 h-4 w-4" />
                Publish Dravya Post
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
