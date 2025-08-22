
'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCitationDetails } from '@/services/citation.service';
import type { Citation as CitationType } from '@/types';
import { Transliterate } from '@/components/transliteration-provider';

export function PublicCitationTooltip({ refId }: { refId: string }) {
  const [citation, setCitation] = React.useState<CitationType | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  React.useEffect(() => {
    async function fetchCitation() {
      const data = await getCitationDetails(refId);
      setCitation(data);
    }
    fetchCitation();
  }, [refId]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-primary font-semibold cursor-pointer hover:underline decoration-primary/50 underline-offset-4" data-citation-node={refId}>
            [[{refId}]]
          </span>
        </TooltipTrigger>
        {isMounted && (
            <TooltipContent className="max-w-sm">
            {citation ? (
                <div className="space-y-1">
                    <p className="font-headline text-primary/90"><Transliterate>{citation.sanskrit}</Transliterate></p>
                    <p className="text-sm italic text-muted-foreground">{citation.english}</p>
                    <p className="text-xs font-semibold pt-1">{citation.source}, {citation.location}</p>
                </div>
            ) : (
                <span>Loading citation...</span>
            )}
            </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
