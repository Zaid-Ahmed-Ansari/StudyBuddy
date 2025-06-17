'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight, Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import ChatListSkeleton from '@/components/ChatListSkeleton';

export default function AIChatLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    async function loadChats() {
      try {
        const response = await axios.get(`/api/chat/${user?.id}/list`);
        if (response.data.success) {
          router.replace(`/ai-chat/${user?.id}/${response.data.chats[0]?._id || ''}`);
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
      const res = await fetch(`/api/chat/${user?.id}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      const data = await res.json();

      if (data?.success && data?.chat?._id) {
        router.push(`/ai-chat/${user?.id}/${data.chat._id}`);
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
    <main className="min-h-screen relative overflow-hidden py-12 px-4 text-white">
      <div className="absolute inset-0 opacity-70"></div>

      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center mb-8">
              <Bot className="w-16 h-16 text-accent" />
            </div>

            <h1 className="text-5xl md:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
              AI ChatBot
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Experience the future of conversation with our advanced AI assistant. 
              Get instant answers, creative solutions, and intelligent insights.
            </p>
          </div>

          {/* CTA Section */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button
              onClick={createChat}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-accent px-12 py-4 rounded-full text-white font-bold text-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
              aria-label="Start a new AI chat"
            >
              <MessageCircle className="w-6 h-6 group-hover:animate-pulse hover:text-accent" />
              Create your first chat
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
            </button>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Available 24/7
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Secure & Private
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                Always Learning
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 