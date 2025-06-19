'use client';

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User } from "@/src/types/stats";
import { User2 } from "lucide-react"; // optional icon

export default function UserDrawer({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-xs text-blue-400 hover:underline">
          View
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-950 text-white w-[420px] overflow-y-auto">
        <div className="p-6">
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl p-5 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <User2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">User Details</h2>
            </div>

            <div className="space-y-4">
              <InfoRow label="ID" value={user._id} />
              <InfoRow label="Name" value={user.username || "N/A"} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow
                label="Created At"
                value={new Date(user.createdAt || "").toLocaleDateString()}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-gray-300">
      <span className="font-medium text-gray-400">{label}:</span>
      <span className="text-white truncate max-w-[200px] text-right">{value}</span>
    </div>
  );
}
