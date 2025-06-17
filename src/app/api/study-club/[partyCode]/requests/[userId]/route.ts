import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';

export async function POST(req: NextRequest, context: { params: Promise<{ partyCode: string; userId: string }> }) {
  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partyCode, userId } = await context.params;
    const { action } = await req.json();

    if (action !== 'approve') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const admin = await UserModel.findOne({ email: session.user.email });
    if (!admin || !club.admin.equals(admin._id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the request exists
    const requestIndex = club.pendingRequests.findIndex(req => req.equals(user._id));
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Remove from pending requests
    club.pendingRequests.splice(requestIndex, 1);
    // Add to members
    club.members.push(user._id);
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ partyCode: string; userId: string }> }) {
  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const {params} = context
    const { partyCode, userId } = await params;

    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const admin = await UserModel.findOne({ email: session.user.email });
    if (!admin || !club.admin.equals(admin._id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the request exists
    const requestIndex = club.pendingRequests.findIndex(req => req.equals(user._id));
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Remove from pending requests
    club.pendingRequests.splice(requestIndex, 1);
    await club.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 });
  }
} 