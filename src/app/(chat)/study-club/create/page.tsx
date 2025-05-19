'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const createClubPage = () => {
  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!partyName.trim()) return alert('Please enter a club name');
    setLoading(true);
    try {
      const res = await fetch('/api/study-club/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyName }),
      });
      const data = await res.json();
      if (res.ok && data.party) {
        router.push(`/study-club/admin/${data.party.partyCode}`);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col '>

    <main className=" flex items-center justify-center mt-40 p-6">
      <div className=" rounded-2xl shadow-2xl border p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-accent mb-4">Create Your Study Club</h2>
        <input
          type="text"
          placeholder="Enter Club Name"
          className="w-full border  rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent/20"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          />
        <button
          disabled={loading}
          onClick={handleCreate}
          className="w-full bg-accent hover:bg-accent/70 hover:cursor-pointer text-white font-medium py-3 rounded-xl flex items-center justify-center transition"
          >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Club'}
        </button>
      </div>
    </main>
            </div>
  );
}
export default createClubPage;
