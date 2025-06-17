// GET /api/study-club/[partyCode]/member-status
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../../auth/[...nextauth]/options';

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

    // Find the user
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the study club
    const club = await StudyClubModel.findOne({ partyCode })
      .populate('members', 'username email createdAt')
      .populate('admin', 'username email');
      
    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    // Check membership status
    const isMember = club.members.some(member => member._id.equals(user._id));
    const isAdmin = club.admin._id.equals(user._id);
    
    // If user is not a member and not admin, they were likely removed
    const wasRemoved = !isMember && !isAdmin;

    if (wasRemoved) {
      return NextResponse.json({
        isMember: false,
        isAdmin: false,
        wasRemoved: true,
        message: 'You are no longer a member of this club'
      }, { status: 200 });
    }

    // Return club data if user is still a member or admin
    return NextResponse.json({
      partyCode: club.partyCode,
      partyName: club.partyName,
      members: club.members,
      admin:club.admin,
      isMember,
      isAdmin,
      wasRemoved: false
    });

  } catch (error) {
    console.error('Error checking member status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/study-club/[partyCode]/member-status - Manual status check
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ partyCode: string }> }
) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'check-status') {
      // Delegate to GET method
      return GET(req, context);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in member status POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}