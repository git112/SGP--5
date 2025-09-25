import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, X, Send, Sparkles, User, ChevronDown, ChevronUp, GraduationCap, Briefcase, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

export const PlacementChatbot: React.FC<ChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm PlaceMentor AI, your intelligent placement assistant. I can help you with questions about placements, companies, interviews, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const simulateTyping = (text: string, callback: (char: string) => void) => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        callback(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30);
    return typingInterval;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Replace this with your actual API call
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      let tempMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Simulate typing effect
      simulateTyping(data.answer, (partialText) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, text: partialText }
              : msg
          )
        );
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback responses for demo purposes
      const responses = [
        "Great question! For placement preparation, I recommend focusing on technical skills, soft skills, and understanding the company culture. Would you like me to elaborate on any specific area?",
        "Based on current market trends, companies are looking for candidates with strong problem-solving abilities and relevant technical expertise. What specific role are you targeting?",
        "Interview preparation is crucial for success. I suggest practicing common questions, researching the company, and preparing your own questions to ask. Need help with mock interviews?",
        "That's an excellent point to consider. Company research is vital - look into their values, recent news, and growth trajectory. This shows genuine interest during interviews.",
        "For technical interviews, focus on data structures, algorithms, and system design concepts. Practice coding problems regularly and explain your thought process clearly."
      ];
      
      const botResponse = responses[Math.floor(Math.random() * responses.length)];
      
      let tempMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Simulate typing effect
      simulateTyping(botResponse, (partialText) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, text: partialText }
              : msg
          )
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Action Button - Only show when chat is closed */}
      {!isOpen && (
        <div className={`fixed bottom-4 right-4 z-40 ${className || ''}`}>
          <div className="relative group">
            {/* Main Button */}
            <Button
              onClick={toggleChat}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl hover:scale-105 transition-all duration-300 hover:shadow-primary/30 group-hover:animate-none border-2 border-primary-foreground/20 relative"
              aria-label="Open chat"
            >
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
            </Button>
            
            {/* Pulsing Ring Effect */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
            
            {/* Sparkles Icon - positioned separately to avoid overlap */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center border border-primary-foreground/30">
              <Sparkles className="w-3 h-3 text-primary-foreground animate-pulse" />
            </div>
            
            {/* Notification Badge - repositioned to avoid overlap */}
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl border border-gray-700">
              Chat with PlaceMentor AI
              <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900/95"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window Container */}
      <div className={`fixed bottom-4 right-4 z-50 ${className || ''}`}>
        {/* Chat Window */}
        {isOpen && (
          <div className="transform transition-all duration-300 ease-in-out relative z-50">
            <Card className={`w-80 sm:w-96 shadow-2xl border-2 border-primary/20 backdrop-blur-sm bg-background/95 transition-all duration-300 ${
              isMinimized ? 'h-16' : 'h-[400px] sm:h-[500px]'
            }`}>
            
            {/* Header */}
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-lg border-2 border-primary-foreground/20">
                      <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-background shadow-sm">
                      <div className="w-full h-full rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                      PlaceMentor AI
                    </CardTitle>
                    {isTyping ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">AI is thinking...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">● Online & Ready to Help</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors rounded-full"
                    aria-label={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? 
                      <ChevronUp className="w-4 h-4 text-primary" /> : 
                      <ChevronDown className="w-4 h-4 text-primary" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeChat}
                    className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-full"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            {!isMinimized && (
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                              : 'bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-bl-md border border-border/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.sender === 'bot' && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Sparkles className="w-3 h-3 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed break-words">{message.text}</p>
                              <p className={`text-xs mt-2 ${
                                message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {message.sender === 'user' && (
                              <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {isLoading && !isTyping && (
                      <div className="flex justify-start animate-in slide-in-from-bottom duration-300">
                        <div className="bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              <span className="text-sm">Analyzing your question...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-gradient-to-r from-background/80 to-background backdrop-blur-sm relative z-50">
                  <div className="flex gap-4 items-center w-full relative">
                    <div className="relative flex-1 min-w-0">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about placements, companies, interviews..."
                        className="pr-24 rounded-full border-2 focus:border-primary/50 transition-all duration-200 shadow-sm bg-background/50 backdrop-blur-sm h-10 w-full"
                        disabled={isLoading}
                        maxLength={500}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-background/95 px-2 py-1 rounded-full border z-20">
                        {inputValue.length}/500
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      size="sm"
                      className="w-12 h-10 px-3 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex-shrink-0 relative z-20"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { text: 'Interview Tips', icon: HelpCircle },
                      { text: 'Company Info', icon: Briefcase },
                      { text: 'Resume Help', icon: GraduationCap }
                    ].map((action) => (
                      <Button
                        key={action.text}
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-full px-3 py-1.5 h-auto border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 flex items-center gap-2"
                        onClick={() => setInputValue(action.text)}
                        disabled={isLoading}
                      >
                        <action.icon className="w-3 h-3" />
                        {action.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};