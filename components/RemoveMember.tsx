'use client';

import { useTransition } from 'react';
import { Button } from './ui/button';
import { UserMinus } from 'lucide-react';
import { removeMember } from '@/src/app/actions/removeMember';

export default function RemoveMemberButton({
  clubName,
  userId,
}: {
  clubName: string;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(() => {
      removeMember({ clubName, userId });
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      disabled={isPending}
      onClick={handleRemove}
    >
      <UserMinus className="h-4 w-4 mr-2" />
      {isPending ? 'Removing...' : 'Remove'}
    </Button>
  );
}
