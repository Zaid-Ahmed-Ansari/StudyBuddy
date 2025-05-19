'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Trash2, Loader2 } from 'lucide-react';

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function AdminDashboard() {
  const { partyCode } = useParams();
  const router = useRouter();

  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch club data
  const fetchClubData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/study-club/${partyCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load data');
      setPendingRequests(data.pendingRequests);
      setMembers(data.members);
    } catch (err) {
      alert('Failed to fetch club data');
      router.push('/study-club');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
    
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(true);
    await fetch(`/api/study-club/${partyCode}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await fetchClubData();
    setActionLoading(false);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(true);
    await fetch(`/api/study-club/${partyCode}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await fetchClubData();
    setActionLoading(false);
  };

  const handleKick = async (userId: string) => {
    setActionLoading(true);
    await fetch(`/api/study-club/${partyCode}/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await fetchClubData();
    setActionLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <div className='flex items-center justify-center'>

    <main className=" p-6 mt-10">
      <h1 className="text-3xl font-bold text-accent mb-4">Study Club Admin Dashboard</h1>
      <p className="text-sm font-mono text-gray-500 text-white mb-6">Party Code: <span className="font-mono bg-accent text-white px-2 py-1 rounded">{partyCode}</span></p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Pending Join Requests</h2>
        <div className="grid gap-4">
          {pendingRequests?.length === 0 && (
            <div className="text-gray-500">No pending requests</div>
          )}
          {pendingRequests?.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(user._id)}
                  className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full"
                  disabled={actionLoading}
                  >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleReject(user._id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full"
                  disabled={actionLoading}
                  >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Members</h2>
        <div className="grid gap-4">
          {members?.length === 0 && (
            <div className="text-gray-500">No members yet</div>
          )}
          {members?.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => handleKick(user._id)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-full"
                disabled={actionLoading}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
                </div>
  );
}
