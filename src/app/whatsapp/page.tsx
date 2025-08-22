
'use client';

import React, { useState, useEffect } from 'react';
import ChatPreview from '@/components/WhatsApp/ChatPreview';
import BotConfigCard from '@/components/WhatsApp/BotConfigCard';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { generateWhatsAppResponse } from '@/ai/flows/whatsapp-bot';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  time: string;
};

const WhatsAppPage = () => {
  const { toast } = useToast();
  
  const initialGreeting = "Namaste! Welcome to Oshadham Ayurvedic Clinic. I'm your virtual assistant. How may I help you today?";
  const [messages, setMessages] = useState<Message[]>([]);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for bot configuration
  const [botConfig, setBotConfig] = useState({
    greeting: initialGreeting,
    useAyurvedicForm: false,
  });

  useEffect(() => {
    // Set the initial message only on the client-side to avoid hydration errors.
    setMessages([
      {
        id: 1,
        text: botConfig.greeting,
        sender: 'bot' as const,
        time: format(new Date(), 'p')
      },
    ]);
  }, [botConfig.greeting]);


  const sendMessage = async () => {
    if (message.trim() === '' || isLoading) return;
    
    const newUserMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user' as const,
      time: format(new Date(), 'p')
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    try {
      const chatHistoryForAI = newMessages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const aiResponse = await generateWhatsAppResponse({
        chatHistory: chatHistoryForAI,
        config: botConfig
      });
      
      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse.response,
        sender: 'bot' as const,
        time: format(new Date(), 'p')
      };
      setMessages(prev => [...prev, newBotMessage]);

    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "AI Error",
        description: "Could not get a response from the assistant. Please try again.",
        variant: "destructive",
      });
       const errorBotMessage: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot' as const,
        time: format(new Date(), 'p')
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveConfig = (config: { greeting: string; useAyurvedicForm: boolean; }) => {
    setBotConfig(config);
    // Update the initial message if the greeting changes
    setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[0].id === 1) {
            updated[0].text = config.greeting;
        }
        return updated;
    });

    toast({
      title: "Configuration Saved",
      description: "Your WhatsApp bot settings have been updated.",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BotConfigCard onSave={handleSaveConfig} initialConfig={botConfig} />
      <ChatPreview 
        messages={messages} 
        message={message} 
        setMessage={setMessage}
        sendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default WhatsAppPage;
