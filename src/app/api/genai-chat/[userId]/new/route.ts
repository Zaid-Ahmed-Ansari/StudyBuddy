import { NextResponse } from "next/server";
import  dbConnect  from "@/src/lib/dbConnect";
import { GenAIMessage } from "@/src/models/GenAIMessage";
import { GenAIChat } from "@/src/models/GenAIChat";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { title } = await request.json();
    await dbConnect();
    const params = await context.params

    const chat = await GenAIChat.create({
      userId: params.userId,
      title: title || "New Chat",
    });

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("Failed to create chat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create chat" },
      { status: 500 }
    );
  }
} 