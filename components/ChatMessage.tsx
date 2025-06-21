// components/ChatMessage.tsx
"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Save, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { UserAvatar } from "./UserAvatar";
import { BlockMath, InlineMath } from "react-katex";

interface MessageProps {
  msg: {
    text: string;
    isUser: boolean;
    timestamp: string;
  };
  i: number;
  copiedIndex: number | null;
  savedIndex: number | null;
  user?: any;
  isThinking: boolean;
  handleCopy: (text: string, i: number) => void;
  handleSave: (text: string, i: number) => void;
}

export const ChatMessage = memo(
  ({
    msg,
    i,
    copiedIndex,
    savedIndex,
    user,
    isThinking,
    handleCopy,
    handleSave,
  }: MessageProps) => {
    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.25 }}
        className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-2`}
      >
        <div
          className={`flex gap-2 items-start max-w-[85%] ${msg.isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${msg.isUser ? "" : "bg-gray-700"}`}
          >
            {msg.isUser ? (
              <UserAvatar username={user?.username} size={24} />
            ) : (
              <Bot size={16} />
            )}
          </div>

          <div
            className={`p-4 rounded-2xl shadow-md text-sm relative group break-words max-w-fit ${msg.isUser ? "bg-accent/60 text-white rounded-tr-none" : "bg-gray-800 text-gray-100 rounded-tl-none"}`}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              {(!isThinking || msg.text) && (
                
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                  components={{
                    // Enhanced code block rendering
                    code({ node, className, children, ...props }) {
                      // node is a Code AST node, which has an 'inline' property
                      // See: https://github.com/remarkjs/react-markdown#use-custom-components
                      // @ts-ignore
                      const isInline = node && node.inline === true;
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      if (isInline) {
                        return (
                          <code
                            className="bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-700"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="relative mt-3 mb-3 rounded-lg overflow-hidden border border-gray-700">
                          {language && (
                            <div className="bg-gray-900 px-3 py-2 text-xs text-gray-300 border-b border-gray-700 flex justify-between items-center">
                              <span className="font-medium">{language}</span>
                              <button
                                onClick={() => handleCopy(String(children), i)}
                                className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition text-gray-300 hover:text-white"
                                aria-label="Copy code"
                              >
                                {copiedIndex === i ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          )}
                          <pre className="overflow-x-auto bg-gray-900 p-4 text-gray-100 text-xs leading-relaxed">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                          {!language && (
                            <button
                              onClick={() => handleCopy(String(children), i)}
                              className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded transition"
                              aria-label="Copy code"
                            >
                              {copiedIndex === i ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    },
                    

                    
                    // Enhanced heading styles
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-accent mb-3 mt-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold text-accent mb-2 mt-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-md font-semibold text-accent mb-2 mt-3">
                        {children}
                      </h3>
                    ),

                    // Enhanced list styles
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-200">{children}</li>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-accent pl-4 py-2 bg-gray-700/50 rounded-r italic text-gray-200 my-3">
                        {children}
                      </blockquote>
                    ),

                    // Enhanced table styles
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full border-collapse border border-gray-600 rounded">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-600 px-3 py-2 bg-gray-700 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-600 px-3 py-2">
                        {children}
                      </td>
                    ),

                    // Enhanced paragraph spacing
                    p: ({ children }) => (
                      <p className="text-gray-200 leading-relaxed mb-4">
                        {children}
                      </p>
                    ),

                    // Strong/bold text
                    strong: ({ children }) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),

                    // Enhanced link styles
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-accent hover:text-accent/80 underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>

            <div className="text-[10px] text-zinc-400 mt-2 text-left">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            
            {!msg.isUser && (
              <div className="flex gap-2 mt-3 text-xs text-gray-400 justify-end">
                <button
                  onClick={() => handleCopy(msg.text, i)}
                  className="hover:text-white transition flex items-center gap-1 p-1 rounded hover:bg-gray-700"
                  title="Copy message"
                >
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleSave(msg.text, i)}
                  className="hover:text-accent transition flex items-center gap-1 p-1 rounded hover:bg-gray-700"
                  title="Save message"
                >
                  {savedIndex === i ? (
                    <span className="flex items-center gap-1 text-accent">
                      <Save size={14} /> Saved
                    </span>
                  ) : (
                    <Save size={14} />
                  )}
                </button>
              </div>
            )}
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
      </motion.div>
    );
    
  }
);

ChatMessage.displayName = "ChatMessage";
