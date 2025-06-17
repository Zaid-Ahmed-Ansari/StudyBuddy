// POST /api/study-club/[partyCode]/kick
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../../auth/[...nextauth]/options';

export async function POST(
  req: NextRequest, 
  context: { params: Promise<{ partyCode: string }> }
) {
  try {
    await dbConnect();
    
    const session = await NewAuth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { params } = context
    const { partyCode } = await params;
    const body = await req.json();
    const { userId, notifyMember = false } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Find the current user (admin)
    const currentUser = await UserModel.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Find the study club
    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    // Check if current user is admin
    if (!club.admin.equals(currentUser._id)) {
      return NextResponse.json({ 
        error: 'Forbidden: Only club admin can remove members' 
      }, { status: 403 });
    }

    // Check if user to kick is the admin
    if (club.admin.equals(userId)) {
      return NextResponse.json({ 
        error: 'Cannot remove the club admin' 
      }, { status: 400 });
    }

    // Find the member in the club
    const memberIndex = club.members.findIndex(id => id.equals(userId));
    if (memberIndex === -1) {
      return NextResponse.json({ 
        error: 'User is not a member of this club' 
      }, { status: 404 });
    }

    // Remove the member
    club.members.splice(memberIndex, 1);
    
    // Save the updated club
    await club.save();

    // Get user info for response
    const removedUser = await UserModel.findById(userId).select('username email');

    // If notifyMember flag is set, you could implement additional notification logic here
    // For example, sending an email, creating a notification record, etc.
    if (notifyMember) {
      // Optional: Create a removal log or notification
      console.log(`Member ${removedUser?.username} was removed from club ${club.partyName} by admin`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Member removed successfully',
      removedUser: {
        id: userId,
        username: removedUser?.username,
        email: removedUser?.email
      },
      club: {
        id: club._id,
        partyCode: club.partyCode,
        partyName: club.partyName,
        membersCount: club.members.length,
        pendingRequestsCount: club.pendingRequests.length
      }
    });

  } catch (error) {
    console.error('Error in kick member API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}