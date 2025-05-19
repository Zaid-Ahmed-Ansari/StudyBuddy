'use client';

import { leaveParty } from "@/src/app/actions/leaveParty";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LeavePartyButton({
  clubName,
  userId,
}: {
  clubName: string;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveParty(clubName, userId);
      if (result?.success) {
        window.location.href = "/study-club";
      } else {
        alert(result.error || "Failed to leave the club");
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleLeave}
      disabled={isPending}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Leaving..." : "Leave Party"}
    </Button>
  );
}
