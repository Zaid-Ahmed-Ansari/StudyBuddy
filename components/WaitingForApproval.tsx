"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingForApproval({ clubName }: { clubName: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (checking) return; // prevent overlapping requests

      setChecking(true);
      abortController.current = new AbortController();

      try {
        const res = await fetch(`/api/study-club/${clubName}/pending-requests`, {
          signal: abortController.current.signal,
        });

        const data = await res.json();
        if (data.pendingRequests.length === 0) {
          console.log("Request approved!");
        }
      } catch (error) {
        if (error !== "AbortError") {
          console.error("Error checking approval status:", error);
        }
      } finally {
        setChecking(false);
      }
    }, 5000); // check every 5 seconds

    return () => {
      clearInterval(interval);
      abortController.current?.abort();
    };
  }, [clubName, checking, router]);

  return (
    <div className="text-center mt-10 text-lg text-muted-foreground animate-pulse">
      Waiting for admin approval...
    </div>
  );
}
