import { UserModel } from '@/src/model/User';
import dbConnect from '@/src/lib/dbConnect';

export async function POST(req) {
  await dbConnect();
  const { userId, messages } = await req.json();

  const chat = await UserModel.findOneAndUpdate(
    { userId },
    {
      $push: { messages: { $each: messages } },
      $set: { updatedAt: new Date() },
    },
    { new: true, upsert: true }
  );

  return Response.json({ success: true, chatId: chat._id });
}