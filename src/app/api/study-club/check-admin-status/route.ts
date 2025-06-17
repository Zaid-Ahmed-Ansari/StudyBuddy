import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import { StudyClubModel } from '@/src/model/StudyClub';
import { NewAuth } from '../../auth/[...nextauth]/options';

// Store admin last activity timestamps
const adminActivityMap = new Map<string, number>();

// Update admin activity
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partyCode } = await req.json();
    if (!partyCode) {
      return NextResponse.json({ error: 'Party code is required' }, { status: 400 });
    }

    // Update the admin's last activity timestamp
    adminActivityMap.set(partyCode, Date.now());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating admin activity:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Check and clean up inactive clubs
export async function GET() {
  try {
    await dbConnect();
    const session = await NewAuth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const INACTIVITY_THRESHOLD = 30000; // 30 seconds
    const currentTime = Date.now();

    // Get all clubs
    const clubs = await StudyClubModel.find({}).populate('admin', 'email');

    for (const club of clubs) {
      const lastActivity = adminActivityMap.get(club.partyCode);
      
      // If no activity recorded or activity is older than threshold
      if (!lastActivity || (currentTime - lastActivity > INACTIVITY_THRESHOLD)) {
        // Dismiss the club
        await StudyClubModel.deleteOne({ partyCode: club.partyCode });
        adminActivityMap.delete(club.partyCode);
        
        // Send notification to members (you can implement this)
        console.log(`Club ${club.partyCode} dismissed due to admin inactivity`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 