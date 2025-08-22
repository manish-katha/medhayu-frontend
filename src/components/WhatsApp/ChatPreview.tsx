
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { BotLoading } from '../ui/bot-loading';

interface ChatPreviewProps {
  messages: Array<{
    id: number;
    text: string;
    sender: 'user' | 'bot';
    time: string;
  }>;
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
}

const ChatPreview = ({ messages, message, setMessage, sendMessage, isLoading }: ChatPreviewProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-full">
      <CardHeader className="bg-ayurveda-green/5 border-b">
        <CardTitle className="text-ayurveda-green flex items-center">
          <MessageSquare size={18} className="mr-2" /> WhatsApp Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-[#E5DDD5] h-[500px] relative flex flex-col">
          <div className="bg-[#075E54] text-white p-3 flex items-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-ayurveda-green mr-3 flex items-center justify-center text-white">
              <span className="font-semibold">O</span>
            </div>
            <div>
              <p className="font-medium">Oshadham Bot</p>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
          
          <div ref={scrollAreaRef} className="p-4 overflow-y-auto flex-grow">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div
                  className={`${
                    msg.sender === 'user' 
                      ? 'bg-white' 
                      : 'bg-[#DCF8C6]'
                  } rounded-lg p-3 max-w-xs relative`}
                >
                  {msg.sender === 'bot' && (
                    <p className="text-sm font-medium text-ayurveda-green">Oshadham Bot</p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-[10px] text-gray-500 block text-right mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start mb-3">
                 <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-xs relative">
                    <p className="text-sm font-medium text-ayurveda-green">Oshadham Bot</p>
                    <div className="flex items-center justify-center p-2">
                       <BotLoading size="sm" />
                    </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="bg-[#F0F0F0] p-3 flex items-center flex-shrink-0">
            <Input 
              placeholder="Type a message" 
              className="flex-grow mr-2 rounded-full" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              className="bg-[#075E54] rounded-full"
              onClick={sendMessage}
              disabled={isLoading}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPreview;
