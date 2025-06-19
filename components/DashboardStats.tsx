'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export default function DashboardStats({ stats }: { stats: { totalUsers: number; totalStudyclubs: number } }) {
  const cards: StatCardProps[] = [
    { label: "Total Users", value: stats.totalUsers, accent: "text-blue-400" },
    { label: "Total Study Clubs", value: stats.totalStudyclubs, accent: "text-pink-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {cards.map((card, idx) => (
        <Card key={idx} className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className={card.accent}>{card.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{card.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}
