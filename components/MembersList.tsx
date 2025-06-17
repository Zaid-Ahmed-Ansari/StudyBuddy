'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mic, MicOff, X, Users, Loader2, UserCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

type Member = {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
};

interface MembersListProps {
  isActivitiesPage?: boolean;
  className?: string;
}

export default function MembersList({ isActivitiesPage = false, className = '' }: MembersListProps) {
  const { partyCode } = useParams();
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/study-club/${partyCode}/member`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.members);
      setIsAdmin(data.isAdmin);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partyCode]);

  // Initial fetch
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/study-club/${partyCode}/member/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      // Update local state
      setMembers(prev => prev.filter(m => m._id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <X className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-500 mb-2">Failed to load members</p>
        <Button
          variant="outline"
          onClick={fetchMembers}
          className="text-accent"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-end h-full ${className}`}>
      <div className=''>
      <Button
            variant="ghost"
            size="icon"
            onClick={fetchMembers}
            className="text-accent hover:text-accent/80"
            disabled={isRefreshing}
            title="Refresh members list"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button> 
      </div>
       
      

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <UserAvatar username={member.username} size={40} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{member.username}</p>
                  <p className="text-sm text-gray-400 truncate">{member.email}</p>
                </div>
              </div>
              {isAdmin && member._id !== session?.user?.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  title="Remove member"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}