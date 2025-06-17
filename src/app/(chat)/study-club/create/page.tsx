'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, LogIn } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/src/types/ApiResponse';
import { toast } from 'sonner';

interface StudyClub {
  partyName: string;
  partyCode: string;
  members: Array<{ username: string; email: string }>;
  admin: { username: string; email: string };
}

const CreateClubPage = () => {
  const [partyName, setPartyName] = useState('');
  const [partyNameMessage, setPartyNameMessage] = useState('');
  const [isCheckingPartyName, setIsCheckingPartyName] = useState(false);
  const [isPartyNameAvailable, setIsPartyNameAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingClub, setExistingClub] = useState<StudyClub | null>(null);
  const [isLoadingClub, setIsLoadingClub] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchExistingClub = async () => {
      try {
        const response = await fetch('/api/study-club/user-club');
        const data = await response.json();
        setExistingClub(data.club);
      } catch (error) {
        console.error('Error fetching existing club:', error);
      } finally {
        setIsLoadingClub(false);
      }
    };

    fetchExistingClub();
  }, []);

  const checkPartyName = async (name: string) => {
    if (!name.trim()) return;

    setIsCheckingPartyName(true);
    setPartyNameMessage('');
    try {
      const response = await axios.get(`/api/check-party-unique?partyName=${name}`);
      setPartyNameMessage(response.data.message);
      setIsPartyNameAvailable(response.data.available);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const message = axiosError.response?.data.message || 'Error checking name';
      setPartyNameMessage(message);
      toast.error(message);
      setIsPartyNameAvailable(false);
    } finally {
      setIsCheckingPartyName(false);
    }
  };

  const debouncedCheckPartyName = useDebounceCallback(checkPartyName, 400);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPartyName(name);
    setIsPartyNameAvailable(false);
    setPartyNameMessage('');
    debouncedCheckPartyName(name);
  };

  const handleCreate = async () => {
    if (!partyName.trim()) {
      toast.error('Please enter a club name');
      return;
    }

    if (!isPartyNameAvailable) {
      toast.error('Party name is not available');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/study-club/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyName }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Club created successfully!');
        router.push(`/study-club/${data.partyCode}`);
      } else {
        const data = await res.json();
        switch (res.status) {
          case 400:
            if (data.error === 'You already created a study club.') {
              toast.error('You can only create one study club at a time');
            } else {
              toast.error(data.error || 'Invalid club name');
            }
            break;
          case 401:
            toast.error('Please sign in to create a club');
            break;
          case 404:
            toast.error('User account not found. Please try signing in again');
            break;
          case 500:
            toast.error('Server error. Please try again later');
            break;
          default:
            toast.error(data.error || 'Failed to create club');
        }
      }
    } catch (err) {
      console.error('Error creating club:', err);
      toast.error('Network error. Please check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissClub = async () => {
    if (!existingClub) return;

    try {
      const res = await fetch(`/api/study-club/${existingClub.partyCode}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Club dismissed successfully');
        setExistingClub(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to dismiss club');
      }
    } catch (error) {
      console.error('Error dismissing club:', error);
      toast.error('Failed to dismiss club. Please try again.');
    }
  };

  const handleJoinClub = () => {
    if (existingClub) {
      router.push(`/study-club/${existingClub.partyCode}`);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex md:flex-row flex-col items-center justify-center mt-40 p-6 gap-8">
        <div className="rounded-2xl shadow-2xl border p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-accent mb-4">Create Your Study Club</h2>
          <input
            type="text"
            placeholder="Enter Club Name"
            className="w-full border rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={partyName}
            onChange={handleChange}
          />
          <p className={`text-sm mb-4 ${isPartyNameAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {isCheckingPartyName ? 'Checking availability...' : partyNameMessage}
          </p>
          <button
            disabled={!isPartyNameAvailable || isCheckingPartyName || loading}
            onClick={handleCreate}
            className={`w-full text-white font-medium py-3 rounded-xl flex items-center justify-center transition ${
              !isPartyNameAvailable || isCheckingPartyName || loading
                ? 'bg-accent/50 cursor-not-allowed'
                : 'bg-accent hover:bg-accent/70'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Club'}
          </button>
        </div>

        {isLoadingClub ? (
          <div className="rounded-2xl shadow-2xl border p-8 w-full max-w-md flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : existingClub ? (
          <div className="rounded-2xl shadow-2xl border p-8 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-accent">Your Study Club</h2>
              <button
                onClick={handleDismissClub}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Club Name</p>
                <p className="font-medium">{existingClub.partyName}</p>
              </div>
              <div>
                <p className="text-gray-600">Club Code</p>
                <p className="font-medium">{existingClub.partyCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Members</p>
                <p className="font-medium">{existingClub.members.length} members</p>
              </div>
              <button
                onClick={handleJoinClub}
                className="w-full bg-accent text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/70 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Join Club
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default CreateClubPage;
