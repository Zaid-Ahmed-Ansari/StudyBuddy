// src/app/api/user/saveMessages/route.ts
import { NextResponse } from 'next/server'
import { UserModel } from '@/src/model/User'
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';

export async function POST(request: Request) {
  function generateRandomId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let _id = '';
  for (let i = 0; i < length; i++) {
    _id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return _id;
}
  const session = await NewAuth();
  
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  try {
      const { content, contentType } = await request.json()
      console.log(content)

    if (!content) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
    }

    const _id = generateRandomId()

    // Save message to the user's saved messages array
    const user = await UserModel.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    user.saved.push({
      _id,
        content,
        createdAt: new Date(),
        contentType: contentType || 'plain',
      } as any)
    // Add the new message to saved messages
    
    await user.save()

    return NextResponse.json({ message: 'Message saved successfully!' }, { status: 200 })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ message: 'Error saving message' }, { status: 500 })
  }
}
