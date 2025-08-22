
'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SharePopover() {
  const [url, setUrl] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied to Clipboard',
      description: 'The article link has been copied.',
    });
  };

  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this article: ${url}`
  )}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Share">
          <Share2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Article</h4>
            <p className="text-sm text-muted-foreground">
              Share this article with others.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input id="link" value={url} readOnly className="h-8" />
            <Button size="icon" className="h-8 w-8" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                </a>
            </Button>
            <Button asChild variant="outline">
                 <a href={facebookLink} target="_blank" rel="noopener noreferrer">
                    Facebook
                </a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
