'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Loader2, X } from 'lucide-react';

export default function WaitingForApproval() {
  const { partyCode } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

 const checkStatus = async () => {
  try {
    const res = await fetch(`/api/study-club/waiting/${partyCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ partyCode }),
    });

    const data = await res.json();
    if (res.ok) {
      if (data.status === 'approved') {
        setStatus('approved');
        router.push(`/study-club/member/${partyCode}`);
      } else if (data.status === 'rejected' || data.status === 'not_requested') {
        setStatus('rejected');
      } else {
        setStatus('pending');
      }
    } else {
      setStatus('rejected');
    }
  } catch (err) {
    console.error(err);
    setStatus('rejected');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      {status === 'pending' && (
        <>
          <Clock className="w-12 h-12 text-blue-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-700">Waiting for Approval</h1>
          <p className="text-gray-500 mt-2">Your request to join club <span className="font-mono bg-gray-200 px-2 py-1 rounded">{partyCode}</span> is pending.</p>
          {loading && <Loader2 className="mt-4 w-6 h-6 animate-spin text-blue-400" />}
        </>
      )}
      {status === 'rejected' && (
        <>
          <X className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-red-600">Request Rejected</h1>
          <p className="text-gray-500 mt-2">Your request to join the club was denied by the admin.</p>
        </>
      )}
    </main>
  );
}
