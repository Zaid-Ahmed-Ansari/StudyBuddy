import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import dbConnect from '@/src/lib/dbConnect'
import { UserModel } from '@/src/model/User'
import { encrypt } from '@/src/lib/encryption'
import mongoose from 'mongoose'

export async function POST(
  request: NextRequest,context:
  { params: Promise<{ userId: string; chatId: string; }> } 
) {
  try {
    await dbConnect()
    const awaitedParams = await context.params
    const userId =  awaitedParams.userId
    const { title } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const plainTitle = title?.trim() || 'New Chat'
    const encryptedTitle = await encrypt(plainTitle)

    const newChat = {
      _id: new mongoose.Types.ObjectId(), // manually assign an _id
      userId: new mongoose.Types.ObjectId(userId),
      title: encryptedTitle,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { chats: newChat } },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      chat: {
        _id: newChat._id,
        title: plainTitle,
        createdAt: newChat.createdAt,
        updatedAt: newChat.updatedAt
      }
    })
  } catch (error) {
    console.error('Error creating new chat:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
