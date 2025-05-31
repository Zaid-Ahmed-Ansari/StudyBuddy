import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/model/User";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user and check if they have any chats
    const user = await UserModel.findById(userId).select("chats");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const hasChats = user.chats && user.chats.length > 0;

    if (hasChats) {
      const latestChat = user.chats[0]; // optionally send chatId if needed
      return NextResponse.json({
        success: true,
        message: "Chats found",
        chatId: latestChat._id,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No chats found",
      });
    }
  } catch (error) {
    console.error("Error checking user chats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while checking chats.",
      },
      { status: 500 }
    );
  }
}
