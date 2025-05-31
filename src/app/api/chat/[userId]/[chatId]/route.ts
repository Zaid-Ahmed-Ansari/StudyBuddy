import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/src/lib/dbConnect';
import {UserModel} from '@/src/model/User';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';
import mongoose from 'mongoose';
import { decrypt } from '@/src/lib/encryption';

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string; chatId: string } }
) {
  try {
    await dbConnect();

    const session = await NewAuth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, chatId } = await params;

    // Ensure the user making the request matches the target user
    if (session.user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const result = await UserModel.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { chats: { _id: new ObjectId(chatId) } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: 'Chat not found or not deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}







export const dynamic = "force-dynamic" // Optional: for fresh fetch

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params

  try {
    await dbConnect()
    const session = await NewAuth()

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      })
    }

    const user = await UserModel.findOne({ email: session.user.email })

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      })
    }

    const chat = user.chats.find(
      (c) => c._id.toString() === chatId
    )

    if (!chat) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
      })
    }

    const decryptedMessages = await Promise.all(
      chat.messages.map(async (msg) => ({
        text: await decrypt(msg.text),
        isUser: msg.isUser,
        timestamp: msg.timestamp,
      }))
    )

    return new Response(JSON.stringify({ messages: decryptedMessages }), {
      status: 200,
    })
  } catch (err) {
    console.error("Error fetching chat messages:", err)
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    })
  }
}

