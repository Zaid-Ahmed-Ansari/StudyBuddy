'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SignupSeriesPoint {
  date: string;
  users: number;
}
interface StudyClubSeriesPoint {
  date: string;
  studyclubs: number;
}

export default function DashboardCharts({ signupSeries, studyClubSeries }: { signupSeries: SignupSeriesPoint[]; studyClubSeries: StudyClubSeriesPoint[] }) {
  // Merge the two series by date
  const merged = signupSeries.map((u, i) => ({
    date: u.date,
    users: u.users,
    studyclubs: studyClubSeries[i]?.studyclubs || 0,
  }));

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-blue-400">User Signups & Study Clubs (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} name="User Signups" />
            <Line type="monotone" dataKey="studyclubs" stroke="#ec4899" strokeWidth={2} name="Study Clubs Created" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
