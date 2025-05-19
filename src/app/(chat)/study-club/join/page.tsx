'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function JoinClubPage() {
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!partyCode.trim()) return alert('Please enter a club code');
    setLoading(true);
    try {
      const res = await fetch('/api/study-club/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyCode }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/study-club/waiting/${partyCode}`);
      } else {
        alert(data.error || 'Could not join club');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className=" flex items-center justify-center  mt-40 p-6">
      <div className=" rounded-2xl shadow-xl border p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-accent mb-4">Join a Study Club</h2>
        <input
          type="text"
          placeholder="Enter Club Code"
          className="w-full border rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent/20"
          value={partyCode}
          onChange={(e) => setPartyCode(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={handleJoin}
          className="w-full bg-accent hover:bg-accent/70 hover:cursor-pointer text-white font-medium py-3 rounded-xl flex items-center justify-center transition"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request to Join'}
        </button>
      </div>
    </main>
  );
}
