'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, X, Send, Bot, User, Copy, Check, BookmarkCheck, FileText, Languages, NotebookPen } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Dark theme for code blocks
import { cn } from "@/lib/utils";

export default function AiChat() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (subjectVal: string, topicVal: string) => {
    if (!subjectVal.trim() || !topicVal.trim()) return;
    
    setSubject("");
    setTopic("");
    const controller = new AbortController();
    setAbortController(controller);
    setIsThinking(true);

    const userInput = `Subject: ${subjectVal}\nTopic: ${topicVal}`;
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
        body: JSON.stringify({ subject: subjectVal, topic: topicVal }),
      });

      const data = await res.json();
      // Ensure we're getting a string response
      const fullText = typeof data.text === 'string' ? data.text : JSON.stringify(data.text);

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
  };

  const handleCopy = (text: string, index: number) => {
    // Ensure we're copying a string
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text);
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const handleSave = async (message: string | object, index: number) => {
    try {
      const contentToSave = typeof message === 'string' ? message : JSON.stringify(message);
      await axios.post('/api/user/save', {
        content: contentToSave,
        createdAt: new Date().toISOString()
      });
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 1500);
    } catch (error) {
      console.error('Save error', error);
    }
  };

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function handleSubmit() {
    if (subject.trim() && topic.trim()) {
      handleSendMessage(subject.trim(), topic.trim());
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col ">
      <header className="p-4 text-center border mt-5 mr-5 ml-5 rounded-full text-2xl font-bold  shadow-xl">
        <div className="flex items-center justify-center gap-2">
          <NotebookPen size={24} className="text-accent" />
          <span className='text-accent'>StudyBuddy Notes Generator</span>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar mt-[20px] max-w-6xl mx-auto w-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div className={`flex gap-2 items-start max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div 
                  className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                    msg.isUser ? 'bg-accent/60' : 'bg-gray-700'
                  }`}
                >
                  {msg.isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div
                  className={`p-3 rounded-2xl shadow-md text-sm relative group whitespace-pre-wrap break-words max-w-fit ${
                    msg.isUser
                      ? 'bg-accent/60 text-white rounded-tr-none'
                      : 'bg-gray-800 text-gray-100 rounded-tl-none'
                  }`}
                  style={{ maxWidth: '50vw', overflowWrap: 'break-word' }}
                >
                  {msg.isUser ? (
                    <div className="text-zinc-100 whitespace-pre-line">
                      {msg.text}
                      <div className="block text-[10px] text-zinc-300 mt-1 text-right">{timestamp}</div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-sm">
                      <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code(props) {
                            const { inline, children, ...rest } = props as { inline?: boolean; children: React.ReactNode }
                            return inline ? (
                              <code className="bg-gray-900 px-1 rounded text-xs" {...rest}>
                                {children}
                              </code>
                            ) : (
                              <div className="relative mt-2 mb-2">
                                <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-gray-100 text-xs">
                                  <code {...rest}>{children}</code>
                                </pre>
                                <button
                                  onClick={() => handleCopy(String(children), i)}
                                  className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                                  aria-label="Copy code"
                                >
                                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                            )
                          },
                          p(props) {
                            return <p className="my-1" {...props} />;
                          }
                        }}
                      >
                        {typeof msg.text === 'string' ? msg.text : 'Invalid content format'}
                      </ReactMarkdown>
                      <div className="block text-[10px] text-zinc-400 mt-1 text-right">{timestamp}</div>
                    </div>
                  )}

                  {!msg.isUser && (
                    <div className={`flex gap-2 mt-2 text-xs text-gray-400 ${msg.isUser ? 'justify-start' : 'justify-end'}`}>
                      <button
                        onClick={() => handleCopy(msg.text, i)}
                        className="hover:text-white transition flex items-center gap-1"
                        title="Copy"
                      >
                        {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => handleSave(msg.text, i)}
                        className="hover:text-green-400 transition flex items-center gap-1"
                        title="Save"
                      >
                        {savedIndex === i ? 
                          <span className="flex items-center gap-1"><BookmarkCheck size={14} /> Saved</span> : 
                          <BookmarkCheck size={14} />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-start max-w-[85%]"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-gray-800 text-sm text-gray-300">
              <div className="flex gap-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-6 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full shadow-lg z-50 transition-all duration-200 transform hover:scale-110 active:scale-90"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {isThinking && (
        <button
          onClick={handleAbort}
          className="fixed bottom-32 left-6 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-50 transition-all duration-200 transform hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>
      )}

      <div className="sticky bottom-0 w-full  pt-6 pb-4 px-4">
        <div className="flex flex-col gap-3 max-w-6xl mx-auto bg-gray-800 rounded-xl border border-gray-700 p-3 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-900 text-white px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700 placeholder-gray-500"
              />
            </div>
            <div className="relative flex-1">
              <Languages className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="w-full bg-gray-900 text-white px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700 placeholder-gray-500"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !topic.trim() || isThinking}
            className="w-full bg-accent hover:bg-accent/50 text-white py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            {isThinking ? (
              <div className="typing-indicator inline-flex">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <>
                <Send size={16} />
                Generate Notes
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background: #6366f1;
          border-radius: 50%;
          display: block;
          margin: 0 2px;
          opacity: 0.4;
          animation: typing 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0% {
            transform: translateY(0px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-5px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.4;
          }
        }
        
        /* Remove horizontal scrolling from message bubbles */
        pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        /* This ensures code blocks don't overflow */
        code {
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }
      `}</style>
    </div>
  );
}