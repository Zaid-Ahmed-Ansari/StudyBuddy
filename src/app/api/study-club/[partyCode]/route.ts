// GET /api/study-club/[partyCode]
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { UserModel } from '@/src/model/User';
import { NewAuth } from '../../auth/[...nextauth]/options';

export async function GET(req: NextRequest, context: { params: Promise<{ partyCode: string }> }) {
    

  await dbConnect();
  const { partyCode } = await context.params;

  try {
    const club = await StudyClubModel.findOne({ partyCode })
      .populate('admin', 'username email partyCode')
      .populate('members', 'username email partyCode')
      .populate('pendingRequests', 'username email partyCode')
      .lean();

    if (!club) {
      return NextResponse.json({ error: 'Study club not found' }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ partyCode: string }> }) {
  await dbConnect();
  const { partyCode } = await context.params;

  try {
    // Get the club data before deleting it
    const club = await StudyClubModel.findOne({ partyCode });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Delete the study club
    await StudyClubModel.deleteOne({ partyCode });

    return NextResponse.json({ 
      success: true,
      message: 'Club dismissed successfully',
      club: {
        partyName: club.partyName,
        partyCode: club.partyCode,
        membersCount: club.members.length
      }
    });
  } catch (error) {
    console.error('Error dismissing study club:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss study club' },
      { status: 500 }
    );
  }
}

