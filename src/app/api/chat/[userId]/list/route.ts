import { NextResponse } from 'next/server';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options'; // Adjust path if needed
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User'; // Your Mongoose User model
import { decrypt } from '@/src/lib/encryption';

export async function GET(req: Request) {
  try {
    await dbConnect(); // connect to MongoDB
    const session = await NewAuth(); // get current session

    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findOne({ email: session.user.email })
      
      .select('chats')
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

   const formattedChats = await Promise.all(
  user.chats.map(async (chat) => {
    let title = '';
    try {
      title = await decrypt(chat.title);
    } catch (err) {
      console.error('Failed to decrypt title:', err);
    }

      return {
        _id: chat._id.toString(),
        title,
        createdAt: chat.createdAt?.toISOString() ?? null,
        updatedAt: chat.updatedAt?.toISOString() ?? null,
      };
    })
);

    return NextResponse.json({ success: true, chats: formattedChats });
  } catch (error) {
    console.error('Failed to load chats:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
