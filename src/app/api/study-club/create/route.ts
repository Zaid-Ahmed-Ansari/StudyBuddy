import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import {UserModel} from '@/src/model/User';
import {StudyClubModel} from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';
import { generatePartyCode } from '@/src/lib/utils';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await NewAuth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partyName } = await req.json();
  if (!partyName || typeof partyName !== 'string') {
    return NextResponse.json({ error: 'Party name is required' }, { status: 400 });
  }

  try {
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already created a club
    const existingClub = await StudyClubModel.findOne({ admin: user._id });
    if (existingClub) {
      return NextResponse.json({ error: 'You already created a study club.' }, { status: 400 });
    }

    // Create new club
    const expiresAt = new Date(Date.now() + 40 * 60 * 1000); // 40 minutes from now
    const newClub = await StudyClubModel.create({
      partyName,
      admin: user._id,
      members: [user._id],
      partyCode: generatePartyCode(),
      expiresAt
    });

    console.log('New club created:', {
      ...newClub.toObject(),
      expiresAt: newClub.expiresAt
    });

    return NextResponse.json({
      partyCode: newClub.partyCode,
      message: 'Study club created successfully',
      expiresAt: newClub.expiresAt
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
