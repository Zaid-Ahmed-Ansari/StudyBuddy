import { NextResponse } from "next/server";
import  dbConnect  from "@/src/lib/dbConnect";
import { GenAIMessage } from "@/src/models/GenAIMessage";

import { GenAIChat } from "@/src/models/GenAIChat";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    const { title } = await request.json();
    await dbConnect();
    const params = await context.params

    const chat = await GenAIChat.findOneAndUpdate(
      { _id: params.chatId, userId: params.userId },
      { title },
      { new: true }
    ).lean();

    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("Failed to update chat title:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update chat title" },
      { status: 500 }
    );
  }
} 