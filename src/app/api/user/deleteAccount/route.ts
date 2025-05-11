import { NextResponse } from 'next/server'
import { UserModel } from '@/src/model/User'
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options'
import dbConnect from '@/src/lib/dbConnect'

export async function DELETE() {
  await dbConnect()
  const session = await NewAuth()

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await UserModel.findByIdAndDelete(session.user.id)

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
