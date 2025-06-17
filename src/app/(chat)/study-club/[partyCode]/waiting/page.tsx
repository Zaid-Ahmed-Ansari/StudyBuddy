'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function WaitingPage() {
  const { partyCode } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partyCode) {
      // Set up SSE connection
      const eventSource = new EventSource(`/api/study-club/${partyCode}/send-notification`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'request-status':
            if (data.data.status === 'approved') {
              toast.success('Your request has been approved!');
              router.push(`/study-club/${partyCode}`);
            } else if (data.data.status === 'rejected') {
              toast.error('Your request has been rejected');
              router.push('/study-club');
            }
            break;

          case 'club-dismissed':
            toast.info('The club has been dismissed by the admin');
            router.push('/study-club');
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [partyCode, router]);

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(`/api/study-club/${partyCode}/cancel-request`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Request cancelled successfully');
        router.push('/study-club');
      } else {
        toast.error(data.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to connect to server');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-gray-600">Checking request status...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/study-club')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h1>
            <p className="text-gray-600">
              Your request to join the study club is pending approval from the admin.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-accent font-medium">Party Code</p>
              <p className="text-2xl font-mono mt-1">{partyCode}</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                  Cancel Request
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your join request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Keep Request</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelRequest}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Cancel Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </main>
  );
}