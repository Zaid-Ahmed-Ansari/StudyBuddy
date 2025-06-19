import { NextResponse } from 'next/server';
import { UserModel } from '@/src/model/User';
import { StudyClubModel } from '@/src/model/StudyClub';
import dbConnect from '@/src/lib/dbConnect';
import { NewAuth } from '@/src/app/api/auth/[...nextauth]/options';
import bcrypt from 'bcryptjs';

async function isAdmin() {
  const session = await NewAuth();
  if (!session || session.user?.email !== 'ahmedzaid2627@gmail.com') {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
    await dbConnect();
    if (!(await isAdmin())) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
  
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  
    const userQuery: any = {};
  
    if (search) {
      userQuery.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
  
    // ========== Stats ==========
    const totalUsers = await UserModel.countDocuments();
    const totalStudyClubs = await StudyClubModel.countDocuments();
    const filteredCount = await UserModel.countDocuments(userQuery);
  
    // ========== Paginated Users ==========
    const users = await UserModel.find(userQuery)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  
    // ========== All Study Clubs ==========
    const studyClubs = await StudyClubModel.find({}, {
      _id: 1,
      partyName: 1,
      partyCode: 1,
      admin: 1,
      members: 1,
      createdAt: 1,
    }).lean();
  
    // ========== Time Series (14 Days) ==========
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  
    // --- User Signup Series ---
    const signupAgg = await UserModel.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  
    const signupSeries = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const date = d.toISOString().slice(0, 10);
      const found = signupAgg.find(s => s._id === date);
      return { date, users: found?.count || 0 };
    });
  
    // --- Study Club Creation Series ---
    const clubAgg = await StudyClubModel.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  
    const studyClubSeries = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const date = d.toISOString().slice(0, 10);
      const found = clubAgg.find(s => s._id === date);
      return { date, studyclubs: found?.count || 0 };
    });
  
    // ========== Return Response ==========
    return NextResponse.json({
      totalUsers,
      totalStudyClubs,
      totalFiltered: filteredCount,
      users,
      studyClubs,
      signupSeries,
      studyClubSeries
    });
  }
  
  

export async function DELETE(req: Request) {
  await dbConnect();
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }
  try {
    const { email, id } = await req.json();
    if (!email && !id) {
      return NextResponse.json({ message: 'Missing email or id' }, { status: 400 });
    }
    const user = await UserModel.findOneAndDelete(email ? { email } : { _id: id });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User deleted' });
  } catch (e) {
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
} 