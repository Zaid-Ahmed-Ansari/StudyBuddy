'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, Trash2, Loader2, Users, Clock, RefreshCw, LogOut, UserPlus, MessageCircleIcon, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { UserAvatar } from '@/components/UserAvatar';
import { useSession } from 'next-auth/react';

type Member = {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
};

type ClubData = {
  partyCode: string;
  partyName: string;
  admin: {
    _id: string;
    username: string;
    email: string;
  };
  members: Member[];
  pendingRequests: Member[];
  isAdmin: boolean;
  endTime: string;
};

export default function ClubDashboard() {
  const router = useRouter();
  const { partyCode } = useParams();
  const { data: session, status } = useSession();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [memberToKick, setMemberToKick] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClubData = useCallback(async () => {
    if (!partyCode) return;
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/study-club/${partyCode}/member`);
      const data = await response.json();

      if (response.ok) {
        setClubData(data);
      } else if (response.status === 401) {
        router.push('/auth/signin');
      } else if (response.status === 404) {
        router.push('/study-club');
      } else {
        setError(data.error || 'Failed to load club data');
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [partyCode, router]);

  // Initial fetch only when partyCode changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchClubData();
    }
  }, [partyCode, fetchClubData]);

  // Timer effect
  useEffect(() => {
    if (!clubData?.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(clubData.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Session ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [clubData?.endTime]);

  const handleApprove = async (userId: string) => {
    if (!clubData?.isAdmin) return;
    
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/study-club/${partyCode}/requests/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Request approved successfully');
        await fetchClubData();
      } else {
        toast.error(data.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error('Failed to connect to server');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!clubData?.isAdmin) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/study-club/${partyCode}/requests/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Request rejected successfully');
        await fetchClubData();
      } else {
        toast.error(data.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to connect to server');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveClub = async () => {
    if (clubData?.isAdmin) {
      // Admin dismissing the club
      setIsDismissing(true);
      try {
        const res = await fetch(`/api/study-club/${partyCode}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          toast.success('Club dismissed successfully');
          router.push('/study-club');
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to dismiss club');
        }
      } catch (error) {
        console.error('Error dismissing club:', error);
        toast.error('Failed to connect to server');
      } finally {
        setIsDismissing(false);
      }
    } else {
      // Member leaving the club
      try {
        const res = await fetch(`/api/study-club/${partyCode}/leave-club`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          toast.success('Successfully left the club');
          router.push('/study-club');
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to leave club');
        }
      } catch (error) {
        console.error('Error leaving club:', error);
        toast.error('Failed to connect to server');
      }
    }
  };

  const handleKick = async (userId: string) => {
    if (!clubData?.isAdmin) return;
    setMemberToKick(userId);
    setShowKickDialog(true);
  };

  const confirmKick = async () => {
    if (!memberToKick) return;

    try {
      const response = await fetch(`/api/study-club/${partyCode}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberToKick, notifyMember: true }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.removedUser?.username || 'Member'} has been successfully removed`);
        await fetchClubData();
      } else {
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error kicking member:', error);
      toast.error('Failed to connect to server');
    } finally {
      setShowKickDialog(false);
      setMemberToKick(null);
    }
  };

  const handleTransferAdmin = async (userId: string) => {
    if (!clubData?.isAdmin) return;

    try {
      const toastId = toast("Transferring admin rights...", {
        description: "Please wait while we process your request.",
        duration: 0,
      });

      const response = await fetch(`/api/study-club/${partyCode}/transfer-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAdminId: userId }),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (response.ok) {
        toast.success('Admin rights transferred successfully');
        router.push('/study-club');
      } else {
        toast.error(data.error || 'Failed to transfer admin rights');
      }
    } catch (error) {
      console.error('Error transferring admin rights:', error);
      toast.error('Failed to connect to server');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchClubData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-gray-600">Loading club dashboard...</p>
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

  if (!clubData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No club data found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="border rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-accent">
                {clubData.partyName} {clubData.isAdmin ? 'Admin' : 'Member'} Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Party Code:{" "}
                <span className="font-mono bg-accent text-white px-2 py-1 rounded">
                  {clubData.partyCode}
                </span>
              </p>
              {timeLeft && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
              {clubData.isAdmin ? (
                <button
                  onClick={handleLeaveClub}
                  disabled={isDismissing}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  {isDismissing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Dismiss Club
                </button>
              ) : (
                <button
                  onClick={handleLeaveClub}
                  disabled={isDismissing}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  {isDismissing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Leave Club
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-lg font-semibold">Members</h2>
            </div>
            <p className="text-3xl font-bold mt-2">{clubData.members.length}</p>
          </div>
          {clubData.isAdmin && (
            <div className="border rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                <h2 className="text-lg font-semibold">Pending Requests</h2>
              </div>
              <p className="text-3xl font-bold mt-2">{clubData.pendingRequests.length}</p>
            </div>
          )}
        </div>

        {/* Pending Requests - Admin Only */}
        {clubData.isAdmin && clubData.pendingRequests.length > 0 && (
          <div className="border rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
            <div className="space-y-4">
              {clubData.pendingRequests.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <UserAvatar username={user.username} size={54}/>
                  <div>
                    <h3 className="font-medium text-accent">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(user._id)}
                      disabled={actionLoading === user._id}
                      className="flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="border rounded-lg shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Club Members</h2>
          <div className="space-y-4">
            {clubData.members.map((member) => (
              <div
                key={member._id}
                className="flex gap-3 items-center p-4 border rounded-lg"
              >
                <UserAvatar username={member.username} size={54}/>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-accent">{member.username}</h3>
                    {member._id === clubData.admin._id && (
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  {member.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Joined: {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {clubData.isAdmin && member._id !== clubData.admin._id && (
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex items-center gap-1 bg-accent text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                      <UserPlus className="w-4 h-4" />
                      Make Admin
                    </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-black'>Transfer Admin Rights</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to transfer admin rights to {member.username}? You will no longer be the admin of this club.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleTransferAdmin(member._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Transfer Admin Rights
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <button
                      onClick={() => handleKick(member._id)}
                      className="flex items-center gap-1 bg-accent text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <div className=" rounded-xl shadow-xl border  p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-accent">Study & Collaborate</h2>
              <p className="text-gray-600 text-sm">Connect with your study group through video calls, chat, and document sharing</p>
            </div>
            <a
  href={`/study-club/${partyCode}/activities`}
  target="_blank"
  rel="noopener noreferrer"
>
  <Button
    className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
  >
    <MessageCircleIcon className="w-5 h-5" />
    <span>Open Activities</span>
  </Button>
</a>
          </div>
        </div>

        {timeLeft && (
          <div className="text-sm text-gray-500 mt-2">
            {timeLeft}
          </div>
        )}
      </div>

      <AlertDialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the club? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmKick} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
} 