// lib/getStreamClient.ts
import { StreamChat } from 'stream-chat';

let client: StreamChat | null = null;

export const getStreamClient = () => {
  if (!client) {
    if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
      throw new Error('NEXT_PUBLIC_STREAM_API_KEY is not defined');
    }
    client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY);
  }
  return client;
};
