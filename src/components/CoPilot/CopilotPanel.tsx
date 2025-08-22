
'use client';

import React, { useState, useCallback } from 'react';
import { Mic, Globe, Settings, Send, X, RotateCw, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { languageOptions, type LanguageCode, translate } from '@/utils/translationService';
import CopilotSettings from './CopilotSettings';
import type { ReportAnalysis } from '@/ai/flows/analyze-lab-report';
import { Separator } from '../ui/separator';

// Define the message type explicitly
type MessageRole = 'user' | 'assistant';
type Message = {
  role: MessageRole;
  content: React.ReactNode;
};

const isReportAnalysis = (data: any): data is ReportAnalysis => {
  return data && typeof data === 'object' && 'modern' in data && 'ayurvedic' in data;
};

const AnalysisResult = ({ analysis }: { analysis: ReportAnalysis }) => (
  <div className="space-y-4 text-sm">
    <div className="space-y-2">
      <h4 className="font-semibold text-ayurveda-brown">Modern Perspective</h4>
      <div className="pl-4 border-l-2 border-ayurveda-brown/50 text-xs space-y-1">
        <p><strong>Problem:</strong> {analysis.modern.problem}</p>
        <p><strong>Condition:</strong> {analysis.modern.condition}</p>
        <p><strong>Further Tests:</strong> {analysis.modern.furtherTests}</p>
        <p><strong>Prognosis:</strong> {analysis.modern.prognosis}</p>
      </div>
    </div>
     <div className="space-y-2">
      <h4 className="font-semibold text-ayurveda-green">Ayurvedic Perspective</h4>
       <div className="pl-4 border-l-2 border-ayurveda-green/50 text-xs space-y-1">
        <p><strong>Problem:</strong> {analysis.ayurvedic.problem}</p>
        <p><strong>Condition:</strong> {analysis.ayurvedic.condition}</p>
        <p><strong>Further Tests:</strong> {analysis.ayurvedic.furtherTests}</p>
        <p><strong>Prognosis:</strong> {analysis.ayurvedic.prognosis}</p>
      </div>
    </div>
  </div>
);


const CopilotPanel = () => {
  const { closeCopilotPanel, analysis, setAnalysis } = useCopilot();
  const [prompt, setPrompt] = useState('');
  const [localizeResponse, setLocalizeResponse] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  React.useEffect(() => {
    if (analysis) {
        if (isReportAnalysis(analysis)) {
            setMessages([{ role: 'assistant', content: <AnalysisResult analysis={analysis} /> }]);
        } else {
            setMessages([{ role: 'assistant', content: analysis }]);
        }
    } else {
        setMessages([]);
    }
  }, [analysis]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    
    let assistantContent = `This is a sample response to: "${prompt}"\n\nThe Ayurveda Copilot would normally process your request here with Sanskrit preservation and localization if enabled.`;
    if (localizeResponse) {
        assistantContent = translate(assistantContent, language);
    }
    const assistantMessage: Message = { role: 'assistant', content: assistantContent };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setPrompt('');
  }, [prompt, localizeResponse, language]);

  const getMessageStyle = (role: MessageRole) => {
    return role === 'user' 
      ? "bg-primary/10 text-primary-foreground self-end max-w-[80%] rounded-t-lg rounded-l-lg" 
      : "bg-copilot-saddle-150 self-start w-full rounded-t-lg rounded-r-lg";
  };
  
  const handleClear = () => {
    setAnalysis(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-copilot-stone-100 text-copilot-stone-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-copilot-stone-200 h-16 flex-shrink-0">
         <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-copilot-stone-750 hover:text-copilot-stone-900 h-8 w-8" onClick={closeCopilotPanel}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {analysis ? 'AI Analysis' : 'Ask Acharya ji'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-copilot-stone-750 hover:text-copilot-stone-900 h-8 w-8" onClick={handleClear}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-copilot-stone-750 hover:text-copilot-stone-900 h-8 w-8"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col space-y-4">
        {/* Welcome message or settings when opened */}
        {messages.length === 0 && !isSettingsOpen && (
        <div className="mb-4">
            <h2 className="text-2xl font-light text-ayurveda-green dark:text-ayurveda-green mb-4">
              Hi Acharya, what can I help with today?
            </h2>
            <p className="text-copilot-stone-750">
              Ask me about Ayurvedic treatments, patient cases, or medical research. I'll help you analyze and advise on various aspects of Ayurvedic medicine.
            </p>
        </div>
        )}
        
        {/* Settings panel */}
        {isSettingsOpen && (
        <div className="bg-copilot-saddle-150 rounded-lg p-4">
            <CopilotSettings />
        </div>
        )}
        
        {/* Messages area */}
        {messages.length > 0 && (
        <div className="flex flex-col space-y-4 mb-4">
            {messages.map((msg, index) => (
            <div 
                key={index} 
                className={`p-3 ${getMessageStyle(msg.role)}`}
            >
                {typeof msg.content === 'string' ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p> : msg.content}
            </div>
            ))}
        </div>
        )}
      </div>
      
      {/* Footer / Input Form */}
      <div className="border-t border-copilot-stone-200 p-4 bg-copilot-saddle-150/50 flex-shrink-0">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="localize"
                  checked={localizeResponse}
                  onCheckedChange={setLocalizeResponse}
                />
                <Label htmlFor="localize" className="text-xs text-copilot-stone-750">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Localize
                </Label>
              </div>
              
              {localizeResponse && (
                <Select value={language} onValueChange={(value) => setLanguage(value as LanguageCode)}>
                  <SelectTrigger className="h-7 text-xs w-24 bg-copilot-stone-200 border-copilot-stone-300">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code} className="text-xs">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center gap-2 relative rounded-full bg-copilot-saddle-300/50 border border-copilot-stone-300 pr-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={analysis ? "Ask a follow-up question..." : "Message Copilot"}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full pl-4"
              />
              <div className="flex items-center">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-copilot-stone-750">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
    </div>
  );
};

export default CopilotPanel;
