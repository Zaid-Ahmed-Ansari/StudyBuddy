"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, Languages, Search, SendIcon, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState, useRef } from "react";

interface MultimodalInputProps {
  onSendMessage: (message: string, controllerRef: React.MutableRefObject<AbortController | null>) => void;
}

const QuickActions = [
  {
    action: "Type Your queries",
    icon: Search,
    gradient: "from-zinc-900/50 to-black/50",
    hoverGradient: "hover:from-accent-800/50 hover:to-background-900/50",
  },
  {
    action: "Get a summary",
    icon: FileText,
    gradient: "from-zinc-900/50 to-black/50",
    hoverGradient: "hover:from-zinc-800/50 hover:to-zinc-900/50",
  },
  {
    action: "Study the way you like",
    icon: Languages,
    gradient: "from-zinc-900/50 to-black/50",
    hoverGradient: "hover:from-zinc-800/50 hover:to-zinc-900/50",
  },
];

export function MultimodalInput({ onSendMessage }: MultimodalInputProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  function handleSubmit() {
    if (input.trim().length > 0) {
      setIsStreaming(true);
      onSendMessage(input.trim(), controllerRef);
      setInput("");
    }
  }

  function handleAbort() {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <div className="relative flex bg-zinc-900 rounded-xl border border-zinc-800">
        <Textarea
          placeholder="What would you like to do?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={cn(
            "w-full px-4 py-3 resize-none bg-transparent border-none text-zinc-100 text-base",
            "focus:outline-none placeholder:text-zinc-500 min-h-[60px]"
          )}
        />
        
         
          <Button
            className="px-2 py-1 m-4 h-8 rounded-lg text-sm transition-colors hover:bg-zinc-800 flex items-center gap-1 text-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            disabled={input.length === 0 || isStreaming}
            onClick={handleSubmit}
          >
            <SendIcon className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
       
      </div>

      <div className="grid sm:grid-cols-3 gap-2 w-full">
        {QuickActions.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 * index, duration: 0.4, ease: "easeOut" }}
              key={index}
              className={`${index > 1 ? "hidden sm:block" : "block"} h-full`}
            >
              <button
                type="button"
                className="group w-full h-full text-left rounded-lg p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700">
                    <Icon size={14} className="text-zinc-100" />
                  </div>
                  <div className="text-xs text-zinc-100 font-medium">{item.action}</div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
