'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Send, X, ArrowDown, BookmarkCheck, Bot, User, Save } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css' // Switched to dark theme for code blocks


export default function AiChat({chatId,userId}: {chatId: string,userId: string}) {

  



  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [input, setInput] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [savedIndex, setSavedIndex] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const res = await axios.get(`/api/chat/${userId}/${chatId}`);
      setMessages(res.data?.messages);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  };

  fetchMessages();
}, [chatId]);

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    const onScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
      setShowScrollButton(!isAtBottom)
    }
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (userMessage: string) => {
  if (!userMessage.trim()) return;
  setInput('');
  const controller = new AbortController();
  setAbortController(controller);
  setIsThinking(true);
  
  // Add user message and placeholder for AI response
  setMessages(prev => [
    ...prev,
    { text: userMessage, isUser: true },
    { text: '', isUser: false }
  ]);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage })
    });

    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let streamed = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (controller.signal.aborted) break;

      const chunk = decoder.decode(value, { stream: true });
      streamed += chunk;

      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, text: streamed } : msg
        )
      );
      
    }
    try {
  await axios.post(`/api/chat/${userId}/${chatId}/message`, {
    messages: [
    { text: userMessage, isUser: true, timestamp: new Date().toISOString() },
    { text: streamed, isUser: false, timestamp: new Date().toISOString() }
  ]
  });
} catch (err) {
  console.error('Failed to save AI message:', err);
  // Optionally add an error message to the UI
}
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      setMessages(prev => [
        ...prev,
        { text: 'Error fetching response.', isUser: false }
      ]);
    }
  } finally {
    setIsThinking(false);
    setAbortController(null);
  }
};


  const handleAbort = () => {
    abortController?.abort()
    setAbortController(null)
    setIsThinking(false)
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1200)
  }

  const handleSave = async (message: string, index: number) => {
    try {
      await axios.post('/api/user/save', {
        content: message,
        createdAt: new Date().toISOString()
      })
      setSavedIndex(index)
      setTimeout(() => setSavedIndex(null), 1500)
    } catch (error) {
      console.error('Save error', error)
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col md:mr-76 ">
      <header className="p-4 text-center font-sans text-2xl font-bold font-mono border rounded-full mt-5  shadow-xl">
        <div className="flex items-center justify-center gap-2">
          <Bot size={24} className="text-accent" />
          <span className='text-accent'>AI Chatbot</span>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
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
                >
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
                      }
                    }}
                  >
                    {msg.text} 
                  </ReactMarkdown>
                  <div className=' text-[10px] text-zinc-400 mt-1 text-left'>

                    {timestamp}
                  </div>
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
                        className="hover:text-accent transition flex items-center gap-1"
                        title="Save"
                      >
                        {savedIndex === i ? 
                          <span className="flex items-center gap-1"><Save size={14} /> Saved</span> : 
                          <Save size={14} />
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
          className="fixed bottom-24 right-6 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full shadow-lg z-50 transition-all duration-200 transform hover:scale-110 active:scale-90"
        >
          <ArrowDown size={20} />
        </button>
      )}

      <div className="sticky bottom-0 w-full  pt-6 pb-4 px-4">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSendMessage(input)
          }}
          className="flex items-center gap-3 rounded-full bg-gray-800 p-2 border border-gray-700 shadow-lg max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent px-4 py-2 rounded-full focus:outline-none placeholder-gray-400 text-sm"
          />
          <div className="flex gap-2 items-center">
            {isThinking && (
              <button
                onClick={handleAbort}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95"
                title="Abort"
                type="button"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
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
      `}</style>
    </div>
  )
}