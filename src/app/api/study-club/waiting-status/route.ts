import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await NewAuth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { partyCode } = body;

    if (!partyCode || typeof partyCode !== 'string') {
      return NextResponse.json({ error: 'Party code is required' }, { status: 400 });
    }

    const trimmedCode = partyCode.trim().toUpperCase();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const club = await StudyClubModel.findOne({ partyCode: trimmedCode });
    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    const isMember = club.members.some(id => id.equals(user._id));
    if (isMember) {
      return NextResponse.json({ 
        status: 'approved',
        message: 'User is already a member of this club'
      });
    }

    const isPending = club.pendingRequests.some(id => id.equals(user._id));
    if (isPending) {
      return NextResponse.json({ 
        status: 'pending',
        message: 'Request is pending approval'
      });
    }

    // Add user to pending requests
    club.pendingRequests.push(user._id);
    await club.save();

    return NextResponse.json({ 
      status: 'pending',
      message: 'Join request sent successfully'
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    );
  }
}
