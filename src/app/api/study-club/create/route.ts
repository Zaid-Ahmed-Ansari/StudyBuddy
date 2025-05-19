import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import {UserModel} from '@/src/model/User';
import {StudyClubModel} from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';

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
    const newClub = await StudyClubModel.create({
      partyCode: user.partyCode, // assuming it's generated at signup
      partyName,
      admin: user._id,
      pendingRequests: [],
      members: [],
    });

    return NextResponse.json({ party: newClub });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
