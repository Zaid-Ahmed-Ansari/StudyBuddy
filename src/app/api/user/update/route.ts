import { NextResponse } from 'next/server'
import { UserModel } from '@/src/model/User'
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options'
import dbConnect from '@/src/lib/dbConnect'

export async function POST(req: Request) {
  await dbConnect()
  const session = await NewAuth()

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { username, email } = await req.json()

    if (!username || !email) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const user = await UserModel.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if email is being updated to an existing one
    if (email !== user.email) {
      const emailTaken = await UserModel.findOne({ email })
      if (emailTaken) {
        return NextResponse.json({ message: 'Email already in use' }, { status: 400 })
      }
    }

    user.username = username
    user.email = email
    await user.save()

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
