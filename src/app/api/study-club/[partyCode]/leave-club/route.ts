import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../../auth/[...nextauth]/options';
import { sendMemberUpdate } from '@/src/lib/notifications';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ partyCode: string }> }
) {
  try {
    await dbConnect();
    const  { params } = context;
    const { partyCode } = await params;
    
    const session = await NewAuth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if user is admin
    if (club.admin.equals(user._id)) {
      return NextResponse.json({ error: 'Admin cannot leave the club. Please dismiss the club instead.' }, { status: 403 });
    }

    // Check if user is a member
    const memberIndex = club.members.findIndex(memberId => memberId.equals(user._id));
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'You are not a member of this club' }, { status: 403 });
    }

    // Remove member
    club.members.splice(memberIndex, 1);
    await club.save();

    // Send notification
    await sendMemberUpdate(partyCode);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully left the club' 
    });
  } catch (error) {
    console.error('Error leaving club:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}