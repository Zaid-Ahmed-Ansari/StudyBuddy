import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import { encrypt } from '@/src/lib/encryption'; // Optional if you're encrypting titles
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';

export async function PATCH(req: Request, { params }: { params: { userId: string; chatId: string } }) {
  try {
    await dbConnect();

    const session = await NewAuth();
    const { userId, chatId } = await params;
    const { title } = await req.json();

    if (!session || !session.user?.id || session.user.id !== userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    // Encrypt title (optional)
    const encryptedTitle = await encrypt(title.trim());

    const result = await UserModel.updateOne(
      { _id: new ObjectId(userId), 'chats._id': new ObjectId(chatId) },
      {
        $set: {
          'chats.$.title': encryptedTitle,
          'chats.$.updatedAt': new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating chat title:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
