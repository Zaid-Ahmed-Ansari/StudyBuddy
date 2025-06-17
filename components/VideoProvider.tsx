'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { StreamVideoClient } from '@stream-io/video-client';
import { StreamVideo } from '@stream-io/video-react-sdk';

interface VideoProviderProps {
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  token: string;
  children: React.ReactNode;
}

const VideoContext = createContext<StreamVideoClient | null>(null);

export const useVideoClient = () => useContext(VideoContext);

export const VideoProvider = ({ user, token, children }: VideoProviderProps) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          token,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        });

        setClient(videoClient);
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing video client:', error);
      }
    };

    initializeClient();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user, token]);

  if (!isReady || !client) {
    return null;
  }

  return (
    <StreamVideo client={client}>
      <VideoContext.Provider value={client}>{children}</VideoContext.Provider>
    </StreamVideo>
  );
}; 