'use client'
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { tokenProvider } from "@/src/actions/stream.actions";
import { Loader } from "@/components/loader";
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
export default function StreamVideoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [videoClient, setvideoClient] = useState<StreamVideoClient>();
  const clientRef = useRef<StreamVideoClient | null>(null);
  useEffect(() => {
    if (!user) return;
    if (!apiKey) throw new Error("Stream API key is missing");
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user?.id,
        name: user?.username,
        image: `https://localhost:3000/api/show-avatar/${user.username}`

      },
      tokenProvider,
    });
    clientRef.current = client;
    setvideoClient(client)
  }, [user]);

  if(!videoClient)  return <Loader/>

  return <StreamVideo client={videoClient}> 
  {children}
  </StreamVideo>;
}
