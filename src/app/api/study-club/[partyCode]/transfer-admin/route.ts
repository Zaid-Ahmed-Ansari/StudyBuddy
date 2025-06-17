import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../../auth/[...nextauth]/options';
import { sendMemberUpdate } from '@/src/lib/notifications';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ partyCode: string }> }
) {
  try {
    await dbConnect();
    const session = await NewAuth();
    const params = await context.params;

    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { newAdminId } = await req.json();
    if (!newAdminId) {
      return NextResponse.json({ success: false, error: 'New admin ID is required' }, { status: 400 });
    }

    const club = await StudyClubModel.findOne({ partyCode: params.partyCode });

    if (!club) {
      return NextResponse.json({ success: false, error: 'Club not found' }, { status: 404 });
    }

    if (!club.admin._id.equals(session.user.id)) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    // Check if new admin is a member
    const isMember = club.members.some(memberId => memberId.equals(newAdminId));
    if (!isMember) {
      return NextResponse.json({ success: false, error: 'New admin must be a member' }, { status: 400 });
    }

    // Transfer admin rights
    club.admin = newAdminId;
    await club.save();

    // Send notification about admin change
    await sendMemberUpdate(params.partyCode);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin rights transferred successfully' 
    });
  } catch (error) {
    console.error('Error transferring admin rights:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 