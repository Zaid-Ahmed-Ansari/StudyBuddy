// POST /api/study-club/[partyCode]/kick
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../../auth/[...nextauth]/options';
import { UserModel } from '@/src/model/User';

export async function POST(req: NextRequest, context: { params: { partyCode: string } }) {
  await dbConnect();
  const session = await NewAuth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partyCode } = context.params;
  const { memberId } = await req.json();

  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Forbidden: Only admin can kick members' }, { status: 403 });
    }

    const memberIndex = club.members.findIndex(id => id.equals(memberId));
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    club.members.splice(memberIndex, 1);
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
