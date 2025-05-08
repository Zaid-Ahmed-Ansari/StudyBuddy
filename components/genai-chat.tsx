'use client';
import ReactMarkdown from 'react-markdown';
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { ArrowDown, X } from 'lucide-react';
import { MultimodalInput } from "./genaimultimodal";

export default function AiChat() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleSendMessage = async (subject: string, topic: string) => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsThinking(true);

    const userInput = `Subject: ${subject}\nTopic: ${topic}`;
    setMessages(prev => [
      ...prev,
      { text: userInput, isUser: true },
      { text: '', isUser: false },
    ]);

    try {
      const res = await fetch('/api/notes-gen', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic }),
      });

      const data = await res.json();
      const fullText = data.text || 'No response.';

      let streamed = '';
      for (let i = 0; i < fullText.length; i++) {
        await new Promise(r => setTimeout(r, 1));
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

    } catch (err:any) {
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

  return (
    <div ref={chatContainerRef} className="w-full h-[] overflow-y-hidden flex mt-[100px] flex-col items-center justify-center p-4">
      <div className="w-full p-4 max-w-4xl h-[300px] overflow-y-auto rounded-2xl custom-scrollbar">
        <div className="space-y-4">
        

{messages.map((msg, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ delay: 0.1 * index, duration: 0.3 }}
    className={`chat-message ${msg.isUser ? "bg-chat-user w-max max-w-1/2" : "bg-chat-ai w-max max-w-1/2"} p-3 rounded-lg`}
  >
    {msg.isUser ? (
      <p className="text-zinc-100 whitespace-pre-line">
        {msg.text}
        <span className="block text-[10px] text-zinc-400 mt-1 text-right">{timestamp}</span>
      </p>
    ) : (
      <div className="prose prose-invert max-w-none text-sm">
        <ReactMarkdown>{msg.text}</ReactMarkdown>
        <span className="block text-[10px] text-zinc-400 mt-2 text-right">{timestamp}</span>
      </div>
    )}
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
      </div>
      <br />
      <MultimodalInput onSendMessage={handleSendMessage} />
    </div>
  );
}
