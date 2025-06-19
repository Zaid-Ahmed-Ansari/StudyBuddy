'use client';

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User } from "@/src/types/stats";

export default function UserDrawer({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-xs text-blue-400 hover:underline">
          View
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-950 text-white overflow-y-auto w-[400px]">
        <div className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">User Details</h2>
          <div className="text-sm text-gray-400">ID: {user._id}</div>
          <div>Email: {user.email}</div>
          <div>Username: {user.username || "N/A"}</div>
          {Object.entries(user).map(([key, val]) =>
            typeof val === "object" ? null : (
              <div key={key}>
                <span className="font-medium">{key}:</span> {String(val)}
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
