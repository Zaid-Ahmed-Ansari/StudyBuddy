import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await NewAuth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the study club created by the user
    const club = await StudyClubModel.findOne({ admin: user._id })
      .populate('members', 'username email')
      .populate('admin', 'username email')
      .lean();

    if (!club) {
      return NextResponse.json({ club: null });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error('Error fetching user club:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 