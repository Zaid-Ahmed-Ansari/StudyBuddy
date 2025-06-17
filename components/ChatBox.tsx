// components/ChatBox.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatClient } from './ChatProvider';
import type { Channel as ChannelType, Message, MessageResponse } from 'stream-chat';
import { MessageCircle, X, Send, User, Bot, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ChatBoxProps {
  isActivitiesPage?: boolean;
  className?: string;
  onClose?: () => void;
}

export default function ChatBox({ isActivitiesPage = false, className = '', onClose }: ChatBoxProps) {
  const client = useChatClient();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageResponse[]>([]);
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
  }, [messages]);

  useEffect(() => {
    const initChannel = async () => {
      if (!client) return;

      try {
        // Get the party code from the URL - it's the third segment in the path
        const pathSegments = window.location.pathname.split('/');
        const partyCode = pathSegments[pathSegments.indexOf('study-club') + 1];
        
        if (!partyCode) {
          throw new Error('Invalid study club URL');
        }
        
        // Create a unique channel ID using the party code
        const channelId = `study-club-${partyCode}`;
        
        // First, fetch the study club members to ensure we have the correct members list
        const membersResponse = await fetch(`/api/study-club/${partyCode}/member`);
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch study club members');
        }
        const membersData = await membersResponse.json();
        const memberIds = membersData.members.map((member: any) => member._id);

        // Check if channel exists
        const channels = await client.queryChannels({
          id: { $eq: channelId }
        });

        let newChannel;
        if (channels.length > 0) {
          // Use existing channel
          newChannel = channels[0];
          // Get current members
          const currentMembers = newChannel.state.members;
          const currentMemberIds = Object.keys(currentMembers);

          // Add new members
          const membersToAdd = memberIds.filter(id => !currentMemberIds.includes(id));
          if (membersToAdd.length > 0) {
            await newChannel.addMembers(membersToAdd);
          }

          // Remove members who are no longer in the study club
          const membersToRemove = currentMemberIds.filter(id => !memberIds.includes(id));
          if (membersToRemove.length > 0) {
            await newChannel.removeMembers(membersToRemove);
          }
        } else {
          // Create new channel with all current members
          newChannel = client.channel('messaging', channelId, {
            name: `Study Club ${partyCode} Chat`,
            members: memberIds,
          created_by_id: client.userID,
        });
          try {
            await newChannel.create();
          } catch (error) {
            console.error('Error creating channel:', error);
            // If creation fails, try to get the channel again
            const existingChannels = await client.queryChannels({
              id: { $eq: channelId }
            });
            if (existingChannels.length > 0) {
              newChannel = existingChannels[0];
            } else {
              throw error;
            }
          }
        }

        // Watch the channel and load messages
        try {
          const channelResponse = await newChannel.watch();
        setChannel(newChannel);
        setIsLoading(false);

          // Set initial messages
          setMessages(channelResponse.messages as MessageResponse[] || []);

        // Set up message listener
          const handleNewMessage = (event: any) => {
            // Only add the message if it's not already in the messages array
            setMessages((prev) => {
              const messageExists = prev.some(msg => msg.id === event.message.id);
              if (messageExists) return prev;
              return [...prev, event.message as MessageResponse];
        });
          };
          
          newChannel.on('message.new', handleNewMessage);

          // Cleanup function
          return () => {
            newChannel.off('message.new', handleNewMessage);
          };
        } catch (error) {
          console.error('Error watching channel:', error);
          setIsLoading(false);
          throw error;
        }
      } catch (error) {
        console.error('Error initializing channel:', error);
        setIsLoading(false);
      }
    };

    const cleanup = initChannel();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [client]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !channel) return;

    const trimmedMessage = message.trim();
    setMessage(''); // Clear input immediately

    try {
      // Send message
      await channel.sendMessage({
        text: trimmedMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore the message in case of error
      setMessage(trimmedMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Chat</h2>
          <p className="text-gray-500">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
                <Bot size={24} className="text-accent" />
                <span className="text-accent font-semibold">Study Club Chat</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
              style={{ scrollBehavior: 'smooth' }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.user?.id === client.userID ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`flex gap-2 items-start max-w-[85%] ${msg.user?.id === client.userID ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div 
                        className={`flex items-center justify-center h-7 w-7 rounded-full flex-shrink-0 ${
                          msg.user?.id === client.userID ? 'bg-accent/60' : 'bg-gray-700'
                        }`}
                      >
                        <User size={14}/>
                      </div>
                      
                      <div
                        className={`px-3 py-2 rounded-xl shadow-md text-sm relative group whitespace-pre-wrap break-words max-w-fit ${
                          msg.user?.id === client.userID
                            ? 'bg-accent/80 text-white rounded-tr-none'
                            : 'bg-gray-800/90 text-gray-100 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.user?.id !== client.userID && (
                            <span className="text-[10px] font-medium tracking-wide text-accent/90">
                              {msg.user?.name || 'Unknown User'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-sm leading-snug">{msg.text}</div>
                          <span className="text-[9px] text-zinc-400/70">
                            {format(new Date(msg.created_at || ''), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-6 bg-accent hover:bg-accent/90 text-white p-2 rounded-full shadow-lg z-50 transition-all duration-200 transform hover:scale-110 active:scale-90"
              >
                <ArrowDown size={20} />
              </button>
            )}

            {/* Message Input */}
            <div className="sticky bottom-0 w-full pt-6 pb-4 px-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-full bg-gray-800 p-2 border border-gray-700 shadow-lg">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 py-2 rounded-full focus:outline-none placeholder-gray-400 text-sm text-white"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-2 bg-accent hover:bg-accent/90 rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
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
      `}</style>
    </div>
  );
}
