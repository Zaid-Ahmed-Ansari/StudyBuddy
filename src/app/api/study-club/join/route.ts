import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import {UserModel} from '@/src/model/User';
import  { StudyClubModel} from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';
import { useRouter } from 'next/navigation';

export async function POST(req: NextRequest) {
  await dbConnect();
  const router = useRouter();
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

    // Prevent admin from sending join request
    if (club.admin.equals(user._id as any)) {
      return NextResponse.json({ error: 'You are the admin of this club' }, { status: 400 });
    }

    // Check if user is already a member
    if (club.members.some((memberId) => memberId.equals(user._id as any))) {
      return NextResponse.json({ error: 'You are already a member' }, { status: 400 });
    }

    // Check if user already requested
    if (club.pendingRequests.some((reqId) => reqId.equals(user._id as any))) {
      
      router.push(`/study-club/waiting/${partyCode}`);
      return NextResponse.json({ error: 'Join request already pending' }, { status: 400 });
    }

    // Add user to pendingRequests
    club.pendingRequests.push(user._id as any);
    await club.save();

    return NextResponse.json({ success: true, message: 'Join request sent' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
