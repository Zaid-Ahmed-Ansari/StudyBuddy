// app/api/set-avatar/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/src/lib/dbConnect'
import { UserModel } from '@/src/model/User'

export async function POST(req: Request) {
  try {
    const { username, seed, style } = await req.json()

    if (!username || !seed || !style) {
      return NextResponse.json({ message: 'Missing data' }, { status: 400 })
    }

    await dbConnect()

    const updated = await UserModel.findOneAndUpdate(
      { username, hasSelectedAvatar: false },
      {
        avatar: { seed, style },
        hasSelectedAvatar: true,
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ message: 'Invalid or already set' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Avatar seed saved' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
