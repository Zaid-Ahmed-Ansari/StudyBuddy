"use server";
import { NewAuth } from "@/src/app/api/auth/[...nextauth]/options";
import { StreamClient } from "@stream-io/node-sdk";


const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export const tokenProvider = async () => {
  const session = await NewAuth();
  const user = session?.user;


  if (!user) throw new Error("User not authenticated");
  if (!apiKey || !apiSecret)
    throw new Error("Stream API key or secret is missing");

  const client = new StreamClient(apiKey, apiSecret);

  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.round(Date.now() / 1000) - 60;
  
  const token = client.generateUserToken({ user_id: user?.id, exp, issued });
  return token;
};
