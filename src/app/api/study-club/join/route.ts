import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { partyCode } = await req.json();
    console.log('Received body:', partyCode);

    if (!partyCode || typeof partyCode !== 'string') {
      return NextResponse.json({ success: false, error: 'Party code is required' }, { status: 400 });
    }

    const trimmedCode = partyCode.trim().toUpperCase();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const club = await StudyClubModel.findOne({ partyCode: trimmedCode });
    if (!club) {
      return NextResponse.json({ success: false, error: 'Study club not found' }, { status: 404 });
    }

    // If user is admin, add them directly as a member
    if (club.admin.equals(user._id)) {
      if (!club.members.some((memberId) => memberId.equals(user._id))) {
        club.members.push(user._id);
        await club.save();
      }
      return NextResponse.json({ success: true, isAdmin: true });
    }

    if (club.members.some((memberId) => memberId.equals(user._id))) {
      return NextResponse.json({ success: false, error: 'You are already a member' }, { status: 401 });
    }

    if (club.pendingRequests.some((reqId) => reqId.equals(user._id))) {
      return NextResponse.json({ success: false, error: 'Join request already pending' }, { status: 402 });
    }

    club.pendingRequests.push(user._id);
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining club:', error);
    return NextResponse.json({ success: false, error: 'Failed to join club' }, { status: 500 });
  }
}
