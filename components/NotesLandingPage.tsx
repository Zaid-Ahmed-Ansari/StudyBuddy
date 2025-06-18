'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import ChatListSkeleton from '@/components/ChatListSkeleton';

export default function NotesLandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    async function loadChats() {
      try {
        const response = await axios.get(`/api/genai-chat/${user?.id}/list`);
        if (response.data.success) {
          router.replace(`/notes-generator/${user?.id}/${response.data.chats[0]?._id || ''}`);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setIsVisible(true); 
      }
    }

    loadChats();
  }, [user?.id]);

  const createChat = async () => {
    try {
      const res = await fetch(`/api/genai-chat/${user?.id}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      const data = await res.json();

      if (data?.success && data?.chat?._id) {
        router.push(`/notes-generator/${user?.id}/${data.chat._id}`);
      } else {
        console.error('Failed to create chat:', data?.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if(!user?.id || !isVisible) {
    return <ChatListSkeleton/>
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-accent/10 p-4 rounded-full">
              <Bot size={48} className="text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Welcome to StudyBuddy Notes Generator</h1>
          <p className="text-gray-400 text-lg">
            Generate comprehensive study notes with the help of AI. Start a new chat to begin!
          </p>
        </div>

        <button
          onClick={createChat}
          className="bg-accent hover:bg-accent/80 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <MessageCircle size={20} />
          Start New Chat
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
