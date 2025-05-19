// POST /api/study-club/[partyCode]/requests
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../../auth/[...nextauth]/options';

export async function POST(req: NextRequest, context: { params: { partyCode: string } }) {
  await dbConnect();
  const session = await NewAuth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partyCode } = context.params;
  const { userId, action } = await req.json(); // action: 'approve' or 'reject'

  if (!userId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
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

    if (!club.admin.equals(user._id as any)) {
      return NextResponse.json({ error: 'Forbidden: Only admin can approve/reject' }, { status: 403 });
    }

    const requestIndex = club.pendingRequests.findIndex(id => id.equals(userId));
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Add to members if not already
      if (!club.members.includes(userId)) {
        club.members.push(userId);
      }
    }

    // Remove from pending
    club.pendingRequests.splice(requestIndex, 1);
    await club.save();

    return NextResponse.json({ success: true, club });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
