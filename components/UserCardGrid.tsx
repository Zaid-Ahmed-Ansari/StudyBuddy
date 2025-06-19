'use client';

import { Card, CardContent } from "@/components/ui/card";
import { StudyClub, User } from "@/src/types/stats";
import { Button } from "@/components/ui/button";
import UserDrawer from "./UserDrawer";



interface Props {
  users: User[];
  studyclubs?: StudyClub[];
}

export default function UserCardGrid({ users, studyclubs = [] }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {users.map((user) => (
          <Card key={user._id} className="bg-gray-900 border-gray-800 text-white relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{user.username || "No Username"}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <UserDrawer user={user} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {studyclubs.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4 text-pink-400">Study Clubs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {studyclubs.map((club) => (
              <Card key={club._id} className="bg-pink-900 border-pink-700 text-white relative">
                <CardContent className="p-4">
                  <div className="font-semibold text-lg mb-1">{club.partyName}</div>
                  <div className="text-sm text-pink-200 mb-1">Code: {club.partyCode}</div>
                  <div className="text-xs text-pink-300 mb-1">Admin: {club.admin}</div>
                  <div className="text-xs text-pink-300 mb-1">Members: {club.members?.length || 0}</div>
                  <div className="text-xs text-pink-400">Created: {club.createdAt?.slice(0, 10)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
