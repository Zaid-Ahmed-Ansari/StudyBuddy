'use client';

import { useEffect, useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import UserFilterBar from "@/components/UserFIlterBar";
import UserCardGrid from "@/components/UserCardGrid";
import ExportMenu from "@/components/ExportMenu";
import DashboardCharts from "@/components/DashboardCharts";
import { Stats } from "@/src/types/stats";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    fetch(`/api/admin-dashboard?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}`)
      .then(res => res.json())
      .then(setStats);
  }, [page, search, sortBy]);

  return (
    <div className="p-6 space-y-10  min-h-screen text-white">
      {stats && <DashboardStats stats={{ totalUsers: stats.totalUsers, totalStudyclubs: stats.totalStudyclubs }} />}
      {stats && <DashboardCharts signupSeries={stats.signupSeries || []} studyClubSeries={stats.studyClubSeries || []} />}
      <div className="flex items-center justify-between">
        <UserFilterBar search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />
        <ExportMenu data={stats?.users || []} />
      </div>
      <UserCardGrid users={stats?.users || []} studyclubs={stats?.clubs || []} />
      {/* Pagination controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Prev</button>
        <span className="px-4 py-2">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">Next</button>
      </div>
    </div>
  );
}
