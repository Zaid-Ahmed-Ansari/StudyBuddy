import { NextResponse } from "next/server";
import  dbConnect  from "@/src/lib/dbConnect";
import { GenAIMessage } from "@/src/models/GenAIMessage";
import { GenAIChat } from "@/src/models/GenAIChat";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params
    // Delete the chat and all its messages
    const [chat] = await Promise.all([
      GenAIChat.findOneAndDelete({ _id: params.chatId, userId: params.userId }),
      GenAIMessage.deleteMany({ chatId: params.chatId })
    ]);

    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete chat" },
      { status: 500 }
    );
  }
} 