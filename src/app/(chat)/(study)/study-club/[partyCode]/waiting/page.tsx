'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export default function WaitingPage() {
  const router = useRouter();
  const { partyCode } = useParams();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRequestStatus = useCallback(async () => {
    if (!partyCode || !session?.user?.id) return;

    try {
      setIsChecking(true);
      setError(null);

      const response = await fetch(`/api/study-club/${partyCode}/member`);
      const data = await response.json();

      if (response.ok) {
        // User is now a member, redirect to club page
        router.replace(`/study-club/${partyCode}`);
        return;
      }

      // Check if request exists
      const requestResponse = await fetch(`/api/study-club/${partyCode}/requests`);
      const requestData = await requestResponse.json();

      if (requestResponse.ok && requestData.pending) {
        // Request is still pending, continue polling
        return;
      }

      
    } catch (err) {
      console.error('Error checking request status:', err);
      setError('Failed to check request status');
    } finally {
      setIsChecking(false);
    }
  }, [partyCode, session?.user?.id, router]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Initial check
    checkRequestStatus();

    // Set up polling every 5 seconds
    const interval = setInterval(checkRequestStatus, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [status, session, checkRequestStatus]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Checking request status...</h2>
          <p className="text-gray-400">Please wait while we check your request.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-500">Error</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={checkRequestStatus}
            className="mt-4 px-4 py-2 bg-accent text-white rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Waiting for Approval</h2>
        <p className="text-gray-400">
          Your request to join the study club is pending approval.
          <br />
          We'll automatically check the status every few seconds.
        </p>
      </div>
    </div>
  );
}