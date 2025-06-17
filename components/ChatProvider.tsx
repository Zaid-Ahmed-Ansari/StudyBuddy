// components/ChatProvider.tsx
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { getStreamClient } from '@/src/lib/getStreamClient';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
  LoadingIndicator,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

interface ChatProviderProps {
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  token: string;
  children: React.ReactNode;
}

const ChatContext = createContext<StreamChat | null>(null);

export const useChatClient = () => useContext(ChatContext);

export const ChatProvider = ({ user, token, children }: ChatProviderProps) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const connect = async () => {
      const chat = getStreamClient();

      if (!chat.userID) {
        await chat.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          token
        );
      }

      setClient(chat);
      setIsReady(true);
    };

    connect();

    return () => {
      // Optional logout: chat.disconnectUser();
    };
  }, [user, token]);

  if (!isReady || !client) {
    return <LoadingIndicator />;
  }

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <ChatContext.Provider value={client}>{children}</ChatContext.Provider>
    </Chat>
  );
};
