"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Send, X, ArrowDown, Bot, Paperclip } from "lucide-react";
import axios from "axios";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import { UserAvatar } from "./UserAvatar";
import { useSession } from "next-auth/react";
import { ChatMessage } from "./ChatMessage";

const ChatInput = memo(function ChatInput({
  input,
  setInput,
  handleSendMessage,
  isThinking,
  handleAbort,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSendMessage: (msg: string, file?: File | null) => void;
  isThinking: boolean;
  handleAbort: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const setFile = (file: File | null) => {
    setSelectedFile(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          setFile(blob);
          e.preventDefault();
        }
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input, selectedFile);
    setInput("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-full bg-gray-800 p-2 border border-gray-700 shadow-lg max-w-4xl mx-auto"
    >
      <input
        ref={textInputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPaste={handlePaste}
        placeholder="Ask a question or paste an image..."
        className="flex-1 bg-transparent px-4 py-2 rounded-full focus:outline-none placeholder-gray-400 text-sm text-white"
      />

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleFileClick}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        {selectedFile && (
          <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-xs text-gray-300 max-w-[180px]">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-6 h-6 object-cover rounded"
              />
            )}
            <span className="truncate">{selectedFile.name}</span>
            <button
              onClick={() => setFile(null)}
              className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove attachment"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
          disabled={isThinking || (!input.trim() && !selectedFile)}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
});

export default function AiChat({
  chatId,
  userId,
}: {
  chatId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<
    { text: string; isUser: boolean; timestamp: string }[]
  >([]);
  const [isThinking, setIsThinking] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start", // or 'end', depending on layout
      });
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        const res = await axios.get(`/api/chat/${userId}/${chatId}`);
        setMessages(res.data?.messages);
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;
      setShowScrollButton(!isAtBottom);
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100); // wait for DOM to render

    return () => clearTimeout(timeout);
  }, [messages]);
  const isUserNearBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return false;
    const threshold = 80; // pixels from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  const handleSendMessage = async (userMessage: string, file?: File | null) => {
    if (!userMessage.trim()) return;
    const contextMessages = messages.slice(-10);
    const formattedContext = contextMessages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));
    setInput("");
    const controller = new AbortController();
    setAbortController(controller);
    setIsThinking(true);

    const currentTime = new Date().toISOString();

    // Add user message and placeholder for AI response
    setMessages((prev) => [
      ...prev,
      { text: userMessage, isUser: true, timestamp: currentTime },
      { text: "", isUser: false, timestamp: currentTime },
    ]);

    try {
      const formData = new FormData();
      formData.append("prompt", userMessage);
      formData.append("context", JSON.stringify(formattedContext));
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        body: formData,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let lastUpdate = Date.now();
      const updateInterval = 16; // ~60fps

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Update the UI at a consistent rate for smooth animation
        const now = Date.now();
        if (now - lastUpdate >= updateInterval) {
          setMessages((prev) =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, text: buffer } : msg
            )
          );
          lastUpdate = now;
        }
      }
      if (isUserNearBottom()) {
        scrollToBottom();
      }
      // Final update to ensure we have the complete message
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, text: buffer } : msg
        )
      );
      console.log("AI response received:", buffer);
      
      // Save messages only after the complete response is received
      if (buffer) {
        try {
          await axios.post(`/api/chat/${userId}/${chatId}/message`, {
            messages: [
              { text: userMessage, isUser: true, timestamp: currentTime },
              { text: buffer, isUser: false, timestamp: currentTime },
            ],
          });
        } catch (err) {
          console.error("Failed to save AI message:", err);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            text: "Error fetching response.",
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ]);
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

  // Memoize handlers so their reference doesn't change on every render
  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  }, []);

  const handleSave = useCallback(async (message: string, index: number) => {
    try {
      await axios.post("/api/user/save", {
        content: message,
        createdAt: new Date().toISOString(),
      });
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 1500);
    } catch (error) {
      console.error("Save error", error);
    }
  }, []);

  // Memoize the message list so the array reference doesn't change unless messages actually change
  const memoizedMessages = useMemo(() => messages, [messages]);

  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen text-white flex flex-col md:mr-76">
      <header className="p-4 text-center font-sans text-2xl font-bold font-mono border rounded-full mt-5 shadow-xl">
        <div className="flex items-center justify-center gap-2">
          <Bot size={24} className="text-accent" />
          <span className="text-accent">AI Chatbot</span>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        <AnimatePresence initial={false}>
          {memoizedMessages.map((msg, i) => (
            <ChatMessage
              key={msg.timestamp + (msg.text ? msg.text.slice(0, 8) : "")}
              msg={msg}
              i={i}
              copiedIndex={copiedIndex === i ? copiedIndex : null}
              savedIndex={savedIndex === i ? savedIndex : null}
              user={user}
              isThinking={
                isThinking && i === messages.length - 1 && !msg.isUser
              }
              handleCopy={handleCopy}
              handleSave={handleSave}
            />
          ))}
        </AnimatePresence>
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

      <div className="sticky bottom-0 w-full pt-6 pb-4 px-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isThinking={isThinking}
          handleAbort={handleAbort}
        />
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

        /* Enhanced KaTeX math rendering styles */
        .katex-display {
  display: block;
  margin: 1.5rem auto;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}
        .katex {
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}
