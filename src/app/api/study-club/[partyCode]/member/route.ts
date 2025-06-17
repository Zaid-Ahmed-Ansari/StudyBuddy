// GET /api/study-club/[partyCode]/member
import { NextRequest, NextResponse } from 'next/server';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../../auth/[...nextauth]/options';
import dbConnect from '@/src/lib/dbConnect';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
}

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

    // Find the current user
    const currentUser = await UserModel.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { params } = context;
    const partyCode = await params;
    const club = await StudyClubModel.findOne({ partyCode})
      .select('partyCode partyName admin members pendingRequests createdAt expiresAt')
      .populate<{ members: User[] }>('members', 'username email createdAt')
      .populate<{ admin: User }>('admin', 'username email')
      .populate<{ pendingRequests: User[] }>('pendingRequests', 'username email createdAt');

    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    // Check if user is a member or admin
    const isMember = club.members.some(member => member._id.toString() === currentUser._id.toString());
    const isAdmin = club.admin._id.toString() === currentUser._id.toString();

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Not a member of this club' }, { status: 403 });
    }

    // Format the response data
    const responseData = {
      partyCode: club.partyCode,
      partyName: club.partyName,
      admin: {
        _id: club.admin._id.toString(),
        username: club.admin.username,
        email: club.admin.email,
        createdAt: club.admin.createdAt
      },
      members: club.members.map(member => ({
        _id: member._id.toString(),
        username: member.username,
        email: member.email,
        createdAt: member.createdAt
      })),
      pendingRequests: club.pendingRequests.map(request => ({
        _id: request._id.toString(),
        username: request.username,
        email: request.email,
        createdAt: request.createdAt
      })),
      stats: {
        membersCount: club.members.length,
        pendingRequestsCount: club.pendingRequests.length
      },
      isAdmin,
      createdAt: club.createdAt,
      expiresAt: club.expiresAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in member route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}