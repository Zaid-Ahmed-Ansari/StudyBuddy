// GET /api/study-club/[partyCode]
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';

export async function GET(req: NextRequest, context: { params: { partyCode: string } }) {
    

  await dbConnect();
  const { partyCode } = context.params;

  try {
    const club = await StudyClubModel.findOne({ partyCode })
      .populate('admin', 'username email partyCode')
      .populate('members', 'username email partyCode')
      .populate('pendingRequests', 'username email partyCode')
      .lean();

    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
