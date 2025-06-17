import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../../auth/[...nextauth]/options';

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

    // Verify current user is admin
    if (!club.admin.equals(session.user.id)) {
      return NextResponse.json({ success: false, error: 'Only admin can transfer ownership' }, { status: 403 });
    }

    // Verify new admin is a member
    if (!club.members.some(memberId => memberId.equals(newAdminId))) {
      return NextResponse.json({ success: false, error: 'New admin must be a member' }, { status: 400 });
    }

    // Transfer admin role
    club.admin = newAdminId;
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error transferring admin:', error);
    return NextResponse.json({ success: false, error: 'Failed to transfer admin' }, { status: 500 });
  }
} 