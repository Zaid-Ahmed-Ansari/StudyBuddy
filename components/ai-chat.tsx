'use client'

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { ArrowDown, X } from 'lucide-react';
import { MultimodalInput } from "./multimodal-input";
import axios from "axios";
import { toast } from "sonner";
// import { Message } from "@/src/model/User";

export default function AiChat() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleSendMessage = async (userMessage: string) => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsThinking(true);

    setMessages(prev => [
      ...prev,
      { text: userMessage, isUser: true },
      { text: '', isUser: false },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();
      const fullText = data.text || 'No response.';

      let streamed = '';
      for (let i = 0; i < fullText.length; i++) {
        await new Promise(r => setTimeout(r, 8));
        streamed += fullText[i];

        if (controller.signal.aborted) {
          setIsThinking(false);
          return;
        }

        setMessages(prev =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, text: streamed } : msg
          )
        );
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { text: 'Error fetching response.', isUser: false }]);
      }
    } finally {
      setIsThinking(false);
      setAbortController(null);
    }
  };

  const handleAbort = () => {
    abortController?.abort();
    setAbortController(null);
    setIsThinking(false);
    setMessages(prev =>
      prev.filter((_, i) => i !== prev.length - 1) // remove unfinished bot message
    );
  };

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSave = async (message: string) => {
    const createdAt = new Date().toString()
    try {
      const res = await axios.post('/api/user/save', {
        content:message,createdAt},
        {headers: { 'Content-Type': 'application/json' },
        
      });
      
      
      if(res.status == 200){
        
      }
      
      
      
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div ref={chatContainerRef} className="w-full h-full overflow-y-hidden flex flex-col items-center justify-center p-4">
      <div className="w-full p-4 max-w-4xl h-[40vh] overflow-y-auto rounded-2xl custom-scrollbar">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className={`chat-message ${msg.isUser ? "bg-chat-user w-max max-w-1/2" : "bg-chat-ai w-max max-w-1/2"}`}
            >
              <p>{msg.text} <span className="text-[10px] text-zinc-400 mt-1 text-right ">{timestamp}</span></p>
              <button
    onClick={() => {handleSave(msg.text)
      toast.success("Saved Successfully. Visit your dashboard to see it." )
    }
      
    }
    className="mt-3 text-sm px-3 py-1 rounded-md border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-200"
  >
    Save
  </button>
              <div ref={messagesEndRef} />
            </motion.div>
          ))}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 bg-accent hover:bg-accent/80 text-white p-3 rounded-full shadow-lg transition-all z-50"
          >
            <ArrowDown size={20} />
          </button>
        )}

        {isThinking && (
          <button
            onClick={handleAbort}
            className="fixed bottom-24 left-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all z-50"
          >
            <X size={20} />
          </button>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-3xl px-4 md:px-0 mt-6"
        >
          <div className="relative backdrop-blur-xl rounded-xl" />
        </motion.form>
      </div>
      <br />
      <MultimodalInput onSendMessage={handleSendMessage}  />
    </div>
  );
}
