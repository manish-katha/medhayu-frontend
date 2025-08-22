'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowUp, ArrowDown } from 'lucide-react';

const CopilotSettings = () => {
  const [voiceInput, setVoiceInput] = useState(false);
  const [textSize, setTextSize] = useState(16);
  const [preserveSanskrit, setPreserveSanskrit] = useState(true);
  const [enablePhoneticConversion, setEnablePhoneticConversion] = useState(true);

  return (
    <div className="space-y-4 py-2">
      <h4 className="font-medium mb-2">Copilot Settings</h4>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="voice-input" className="text-sm">Voice Input</Label>
        <Switch
          id="voice-input"
          checked={voiceInput}
          onCheckedChange={setVoiceInput}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-size" className="text-sm">Text Size</Label>
          <div className="flex items-center">
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
            <Slider
              id="text-size"
              min={12}
              max={24}
              step={1}
              value={[textSize]}
              onValueChange={(value) => setTextSize(value[0])}
              className="w-24 mx-2"
            />
            <ArrowUp className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right">{textSize}px</div>
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="preserve-sanskrit" className="text-sm">Preserve Sanskrit</Label>
        <Switch
          id="preserve-sanskrit"
          checked={preserveSanskrit}
          onCheckedChange={setPreserveSanskrit}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="phonetic-conversion" className="text-sm">Sanskrit Phonetic Conversion</Label>
        <Switch
          id="phonetic-conversion"
          checked={enablePhoneticConversion}
          onCheckedChange={setEnablePhoneticConversion}
        />
      </div>
    </div>
  );
};

export default CopilotSettings;
