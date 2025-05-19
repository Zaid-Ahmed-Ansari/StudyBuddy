// POST /api/study-club/waiting-status
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../../auth/[...nextauth]/options';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await NewAuth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partyCode } = await req.json();
  if (!partyCode || typeof partyCode !== 'string') {
    return NextResponse.json({ error: 'Party code is required' }, { status: 400 });
  }

  try {
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    const isPending = club.pendingRequests.some(id => id.equals(user?._id as any));
    const isMember = club.members.some(id => id.equals(user?._id as any));

    if (isMember) {
      return NextResponse.json({ status: 'approved' });
    }

    if (isPending) {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({ status: 'not_requested' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
