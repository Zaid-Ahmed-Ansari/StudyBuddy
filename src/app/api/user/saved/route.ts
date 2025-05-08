import { NextResponse } from 'next/server';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';

export async function GET() {
  try {
    const session = await NewAuth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findById(session.user.id).select('saved');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ saved: user.saved });
  } catch (error) {
    console.error('Error fetching saved responses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// src/app/api/user/saveMessages/route.ts



