// 'use client';
import Link from 'next/link';
import { PlusCircle, LogIn } from 'lucide-react';




export default function StudyClubLanding() {
  return (
    <>
      
      <div className='flex flex-col items-center   '>

      <main className="flex flex-col items-center border shadow-2xl justify-center mt-40 rounded-2xl w-[700px]  p-6">
        <h1 className="text-4xl font-bold text-accent mb-2">Welcome to Study Club</h1>
        <p className="text-gray-500 mb-10 text-center max-w-md">
          Join or create your own private study group. Collaborate with your peers in real time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          <Link
            href="/study-club/create"
            className="flex flex-col items-center justify-center gap-2  hover:bg-accent/20 text-blue-800 p-6 rounded-2xl shadow-xl transition-all"
          >
            <PlusCircle className="w-8 h-8" />
            <span className="text-lg font-medium">Create Club</span>
          </Link>

          <Link
            href="/study-club/join"
            className="flex flex-col items-center justify-center gap-2 hover:bg-accent/20 text-green-800 p-6 rounded-2xl shadow-lg transition-all"
            >
            <LogIn className="w-8 h-8" />
            <span className="text-lg font-medium">Join Club</span>
          </Link>
        </div>
      </main>
              </div>
    </>
  );
}



