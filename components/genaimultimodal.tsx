'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileText, Languages, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface MultimodalInputProps {
  onSendMessage: (subject: string, topic: string) => void;
}



export function MultimodalInput({ onSendMessage }: MultimodalInputProps) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  function handleSubmit() {
    if (subject.trim() && topic.trim()) {
      onSendMessage(subject.trim(), topic.trim());
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <Input
          placeholder="Enter Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={cn("bg-transparent text-zinc-100 border-zinc-700")}
        />
        <Input
          placeholder="Enter Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={cn("bg-transparent text-zinc-100 border-zinc-700")}
          onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                }
            }}
        />
        <Button
          className="h-10 mt-2 sm:mt-0 sm:ml-4 bg-white text-black hover:bg-zinc-200"
          onClick={handleSubmit}
          disabled={!subject || !topic}
        >
          Generate
        </Button>
      </div>

     
    </div>
  );
}
