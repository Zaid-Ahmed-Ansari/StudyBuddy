// POST /api/study-club/[partyCode]/requests
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { partyCode } = await context.params;
    const body = await req.json();
    const { userId, action } = body;

    // Validate input
    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid parameters. Action must be "approve" or "reject" and userId is required' 
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

    // Verify user is admin
    if (!club.admin.equals(session.user.id)) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    // Find the pending request
    const requestIndex = club.pendingRequests.findIndex(id => id.equals(userId));
    if (requestIndex === -1) {
      return NextResponse.json({ 
        error: 'Pending request not found for this user' 
      }, { status: 404 });
    }

    if (action === 'approve') {
      // Add user to members
      club.members.push(userId);
    }

    // Remove request
    club.pendingRequests.splice(requestIndex, 1);
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

// GET /api/study-club/[partyCode]/requests - Get pending requests
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ partyCode: string }> }
) {
  try {
    await dbConnect();
    
    const session = await NewAuth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partyCode } = await context.params;

    // Find the current user
    const currentUser = await UserModel.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the study club
    const club = await StudyClubModel.findOne({ partyCode })
      .populate('pendingRequests', 'username email createdAt')
      .populate('members', 'username email');
      
    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    // Check if current user is admin
    if (!club.admin.equals(currentUser._id)) {
      return NextResponse.json({ 
        error: 'Forbidden: Only club admin can view requests' 
      }, { status: 403 });
    }

    return NextResponse.json({
      partyCode,
      partyName: club.partyName,
      pendingRequests: club.pendingRequests,
      members: club.members,
      stats: {
        membersCount: club.members.length,
        pendingRequestsCount: club.pendingRequests.length
      }
    });

  } catch (error) {
    console.error('Error getting requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}