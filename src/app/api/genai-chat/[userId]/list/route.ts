import { NextResponse } from "next/server";
import  dbConnect  from "@/src/lib/dbConnect";
import { GenAIMessage } from "@/src/models/GenAIMessage";
import { GenAIChat } from "@/src/models/GenAIChat";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
    const params = await context.params
  try {
    await dbConnect();
    const chats = await GenAIChat.find({ userId: params.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 