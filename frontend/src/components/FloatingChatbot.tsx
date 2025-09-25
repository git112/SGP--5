import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, X, Bot, User, Minimize2, Maximize2, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I\'m your AI placement assistant. I can help you with:\n\n• 📊 Placement data analysis\n• 🏢 Company information\n• 💼 Career guidance\n• 📈 Interview insights\n\nWhat would you like to know?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount(prev => prev + 1);
    } else if (isOpen) {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
    // Scroll to bottom when maximizing
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={`line-${index}-${line.slice(0, 10)}`}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Button - Only show when chat is closed */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 2, type: "spring", stiffness: 200 }}
        >
        <div className="relative">
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 z-10"
            >
              <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
          
          {/* Pulse Animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ opacity: 0.3 }}
          />
          
          <Button
            onClick={toggleChat}
            className="relative w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20 hover:border-white/40"
            size="lg"
          >
            <motion.div
              animate={{ 
                rotate: (() => {
                  if (!isOpen) return 0;
                  if (isMinimized) return 0;
                  return 45;
                })(),
                scale: (() => {
                  if (isOpen) return 0.9;
                  return 1;
                })()
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {(() => {
                if (!isOpen) return <Bot size={28} />;
                if (isMinimized) return <MessageCircle size={28} />;
                return <X size={28} />;
              })()}
            </motion.div>
          </Button>
        </div>
      </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={(() => {
              if (isMaximized) return 'fixed z-50 top-8 left-8 right-8 bottom-8';
              if (isMinimized) return 'fixed z-40 right-6 bottom-24 w-80 h-16';
              return 'fixed z-40 right-6 bottom-24 w-80 h-96';
            })()}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="h-full flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10 flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <div className="relative">
                    <Bot size={20} />
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span>AI Assistant</span>
                  <Badge className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5">
                    Online
                  </Badge>
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    onClick={minimizeChat}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                    title="Minimize"
                  >
                    <Minimize2 size={16} />
                  </Button>
                  <Button
                    onClick={maximizeChat}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                    title={isMaximized ? "Restore" : "Maximize"}
                  >
                    <Maximize2 size={16} />
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                    title="Close"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {!isMinimized && (
                  <>
                    {/* Messages Area */}
                    <div 
                      className="flex-1 p-4 overflow-y-auto chat-scrollbar" 
                      style={{ 
                        maxHeight: isMaximized ? 'calc(100vh - 240px)' : '260px',
                        minHeight: '180px'
                      }}
                    >
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                message.isUser
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                                  : 'bg-white/20 text-white backdrop-blur-sm border border-white/10'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {!message.isUser && (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {formatMessage(message.text)}
                                  </div>
                                  <div className="text-xs opacity-60 mt-2 flex items-center gap-1">
                                    <span>
                                      {message.timestamp.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                    {message.isUser && (
                                      <>
                                        <span>•</span>
                                        <span>You</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {message.isUser && (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                                    <User size={16} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="bg-white/20 text-white backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Bot size={16} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">AI is thinking...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                
                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                      {/* Chat Controls */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={minimizeChat}
                            size="sm"
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 p-2 h-8 w-8"
                            title="Minimize Chat"
                          >
                            <Minimize2 size={14} />
                          </Button>
                          <Button
                            onClick={maximizeChat}
                            size="sm"
                            variant="ghost"
                            className="text-white/70 hover:text-white hover:bg-white/10 p-2 h-8 w-8"
                            title={isMaximized ? "Restore Chat" : "Maximize Chat"}
                          >
                            <Maximize2 size={14} />
                          </Button>
                        </div>
                        <div className="text-xs text-white/50">
                          {isMaximized ? "Maximized" : "Normal"}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about placement data, companies, or career guidance..."
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                        <Button
                          onClick={sendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          size="sm"
                        >
                          {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;

// Add custom scrollbar styles
const scrollbarStyles = `
  .chat-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(6, 182, 212, 0.8) rgba(255, 255, 255, 0.1);
  }
  
  .chat-scrollbar::-webkit-scrollbar {
    width: 10px;
  }
  
  .chat-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    margin: 5px;
  }
  
  .chat-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8));
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chat-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(6, 182, 212, 1), rgba(59, 130, 246, 1));
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .chat-scrollbar::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, rgba(6, 182, 212, 1), rgba(59, 130, 246, 1));
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .chat-scrollbar::-webkit-scrollbar-corner {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}
