import { NextResponse } from "next/server";
import  dbConnect  from "@/src/lib/dbConnect";
import { GenAIMessage } from "@/src/models/GenAIMessage";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    const { messages } = await request.json();
    await dbConnect();
    const params = await context.params

    // Create messages in bulk
    const messageDocs = messages.map((msg: any) => ({
      userId: params.userId,
      chatId: params.chatId,
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));

    await GenAIMessage.insertMany(messageDocs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save messages" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params
    const messages = await GenAIMessage.find({ chatId: params.chatId })
      .sort({ createdAt: 1 })
      .lean();

    // Transform messages to match the frontend format
    const formattedMessages = messages.map(msg => ({
      text: msg.content,
      isUser: msg.role === "user",
      timestamp: msg.createdAt
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
} 