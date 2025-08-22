
'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Twitter, Facebook, Linkedin } from 'lucide-react';

export function SharePopover() {
  const { toast } = useToast();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({ title: 'Link Copied!', description: 'The link has been copied to your clipboard.' });
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Share">
            <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share this Article</h4>
            <p className="text-sm text-muted-foreground">
              Share a link to this article with others.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                defaultValue={currentUrl}
                readOnly
                className="col-span-2 h-8"
              />
            </div>
            <Button onClick={copyLink} size="sm" className="w-full">
                <Copy className="mr-2 h-4 w-4" /> Copy Link
            </Button>
          </div>
           <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon">
                    <Facebook className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
