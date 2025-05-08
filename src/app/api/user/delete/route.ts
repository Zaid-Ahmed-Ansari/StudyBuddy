import { NextResponse } from "next/server";
import { NewAuth } from "../../auth/[...nextauth]/options";
import { UserModel } from "@/src/model/User";

export async function DELETE(request: Request) {
    const session = await NewAuth();
  
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
  
    try {
      const { id } = await request.json();
      console.log(id)
  
      if (!id || typeof id !== 'string' || id.trim() === '') {
        return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
      }
  
      // Find the user and remove the message from saved messages
      const user = await UserModel.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      // Remove the message from saved
      user.saved = user.saved.filter(msg => msg._id.toString() !== id);
      await user.save();
  
      return NextResponse.json({ message: 'Message deleted successfully!' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json({ message: 'Error deleting message' }, { status: 500 });
    }
  }
  