import mongoose from 'mongoose';
import dbConnect from '@/src/lib/dbConnect';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';
import { UserModel } from '@/src/model/User';
import { encrypt } from '@/src/lib/encryption';

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  const { chatId } = params;

  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const { messages } = await req.json();

    if (
      !Array.isArray(messages) ||
      !messages.every(
        (msg: any) =>
          typeof msg.text === "string" &&
          typeof msg.isUser === "boolean" &&
          typeof msg.timestamp === "string"
      )
    ) {
      return new Response(JSON.stringify({ error: "Invalid message format" }), { status: 400 });
    }

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const chat = user.chats.find(chat => chat._id.toString() === chatId);

    if (!chat) {
      return new Response(JSON.stringify({ error: "Chat not found" }), { status: 404 });
    }

    const encryptedMessages = await Promise.all(
  messages.map(async (msg: any) => ({
    text: await encrypt(msg.text),
    isUser: msg.isUser,
    timestamp: new Date(msg.timestamp),
  }))
);

chat.messages.push(...encryptedMessages);
chat.updatedAt = new Date();
await user.save();

    await user.save();

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("Save Messages Error:", err);
    return new Response(JSON.stringify({ error: "Failed to save messages" }), { status: 500 });
  }
}

