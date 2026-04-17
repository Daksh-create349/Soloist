"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageCircle, MoreHorizontal, Sparkles, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatHistory, sendMessage, MessageResponse } from "@/lib/api";

interface ChatInterfaceProps {
  clientId: number;
  clientName: string;
}

export function ChatInterface({ clientId, clientName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const data = await getChatHistory(clientId);
        setMessages(data.history);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [clientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const text = inputValue.trim();
    setInputValue("");
    
    try {
      setIsSending(true);
      // Optimistic update
      const tempMsg: MessageResponse = {
        id: Date.now(),
        client_id: clientId,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
        is_read: false
      };
      setMessages(prev => [...prev, tempMsg]);

      await sendMessage(clientId, text, "user");
      
      // Simulate client reply after 1.5 seconds for demo loop
      setTimeout(async () => {
        const reply = await sendMessage(clientId, "Thanks for the update on the project! Looking forward to the review.", "client");
        setMessages(prev => [...prev, reply]);
      }, 1500);

    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-primary rounded-[20px] border border-border-tertiary shadow-xl overflow-hidden glass">
      {/* HEADER */}
      <div className="p-5 border-b border-border-tertiary bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-solo-blue/10 flex items-center justify-center text-solo-blue">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary leading-none mb-1">{clientName}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-solo-teal animate-pulse" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Active now</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-text-tertiary hover:text-text-primary">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* MESSAGES */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-text-tertiary space-y-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[12px] font-bold uppercase tracking-widest">Encrypting Channel...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center text-text-tertiary">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[15px] font-bold text-text-primary tracking-tight">No messages yet</h4>
              <p className="text-[13px] text-text-secondary">Start a conversation with {clientName.split(' ')[0]}.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`p-4 rounded-[18px] text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-solo-blue text-white rounded-tr-none' : 'bg-white border border-border-tertiary text-text-primary rounded-tl-none'}`}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter">
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                  {msg.role === 'user' && <CheckCheck className="w-3 h-3 text-solo-teal" />}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* FOOTER / INPUT */}
      <div className="p-5 bg-white border-t border-border-tertiary">
        <div className="relative group">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="h-14 bg-background-secondary border-border-tertiary rounded-[14px] pl-5 pr-14 text-[14px] focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="absolute right-3 top-2.5 w-9 h-9 bg-solo-blue text-white rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button className="flex items-center gap-1.5 text-[11px] font-bold text-solo-blue uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Sparkles className="w-3.5 h-3.5" /> Use AI Assistant
          </button>
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest opacity-60">
            End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
