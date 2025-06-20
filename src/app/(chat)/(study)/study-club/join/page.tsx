'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinClubPage() {
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const trimmedCode = partyCode.trim().toUpperCase();
  const isValidCode = trimmedCode.length >= 4;

  const handleJoin = async () => {
    if (!isValidCode) {
      toast.error('Please enter a valid club code (minimum 4 characters)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/study-club/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyCode: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        switch (res.status) {
          case 401:
            if (data.error === 'You are already a member') {
              toast.error('You are already a member of this club');
              router.push(`/study-club/${trimmedCode}`);
            } else {
              toast.error('Please sign in to join a club');
            }
            break;
          case 402:
            toast.error('You already have a pending request to join this club');
            router.push(`/study-club/${trimmedCode}/waiting`);
            break;
          case 404:
            toast.error('Club not found. Please check the code and try again');
            break;
          case 500:
            toast.error('Server error. Please try again later');
            break;
          default:
            toast.error(data.error || 'Could not join the club');
        }
        return;
      }

      if (res.ok) {
        if (data.isAdmin) {
          toast.success('Welcome to your club!');
          router.push(`/study-club/${partyCode}`);
        } else {
          toast.success('Join request sent successfully!');
          router.push(`/study-club/${partyCode}/waiting`);
        }
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error joining club:', err);
      toast.error('Network error. Please check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center mt-40 p-6">
      <div className="rounded-2xl shadow-xl border p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-accent mb-4">Join a Study Club</h2>
        <input
          type="text"
          placeholder="Enter Club Code"
          className="w-full border rounded-xl p-3 mb-4 uppercase focus:outline-none focus:ring-2 focus:ring-accent/20"
          value={partyCode}
          onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
        />
        <button
          onClick={handleJoin}
          disabled={!isValidCode || loading}
          className={`w-full text-white font-medium py-3 rounded-xl flex items-center justify-center transition ${
            !isValidCode || loading
              ? 'bg-accent/50 cursor-not-allowed'
              : 'bg-accent hover:bg-accent/70'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request to Join'}
        </button>
      </div>
    </main>
  );
}
