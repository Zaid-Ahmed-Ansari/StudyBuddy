'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Bookmark, Bot, CalendarDays, ChartColumn, Home, NotebookPen, NotebookText, Save } from 'lucide-react';
import { Suspense } from 'react';

// Loading component for the entire dashboard
function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header Loading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-64  shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-48 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <div className="h-10 w-32  shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-24  shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-24  shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Grid Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg  dark:bg-gray-800 animate-pulse">
            <div className="h-6 w-3/4  shadow-xl border dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-1/2  shadow-xl border dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-32 shadow-xl border dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === 'loading') {
    return <DashboardLoading />;
  }

  if (!user) return <p className="text-center py-20">Loading your dashboard...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, <span className="text-accent">{user.username}</span> 👋</h1>
          <p className="text-gray-600 mt-1">Here&#39;s your StudyBuddy control center.</p>
        </div>
        <div>
          <button
            className="mt-4 sm:mt-0 px-4 py-2 bg-accent hover:bg-accent/70 text-white rounded-md transition"
          >
            Party Code: {user.partyCode}
          </button>
          <button
            className="mt-4 sm:mt-0 px-4 ml-2 mr-2 py-2 bg-accent text-white rounded-md transition"
          >
            <Link href={`/u/${user.id}`}>
              Profile
            </Link>
          </button>
          <button
            onClick={() => signOut()}
            className="mt-4 sm:mt-0 px-4 hover:cursor-pointer py-2 bg-accent hover:bg-accent/70 text-white rounded-md transition"
          >
            Logout
          </button>
        </div>
      </header>

      <Suspense fallback={<DashboardLoading />}>
        <BentoGrid className=''>
          <BentoCard
            name="Saved Responses"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-blue-100 h-full" />}
            Icon={Save}
            description="View and manage your saved AI responses."
            href="/saved-responses"
            cta="View Saved"
          />
          <BentoCard
            name="Study Planner"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-green-100 h-full" />}
            Icon={CalendarDays}
            description="Plan, organize, and track your study goals with a smart, structured, and visually-rich planner."
            href="/study-planner"
            cta="Schedule your days"
          />
          <BentoCard
            name="AI Chatbot"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-green-100 h-full" />}
            Icon={Bot}
            description="Talk with your own Study Assistant."
            href={`/ai-chat/${user?.id}`}
            cta="Visit your Buddy"
          />
          <BentoCard
            name="Notes Generator"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-blue-100 h-full" />}
            Icon={NotebookPen}
            description="Generate notes by entering subject and relevant topic."
            href="/notes-generator"
            cta="Generate Notes"
          />
          <BentoCard
            name="Notes Summarizer"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-green-100 h-full" />}
            Icon={NotebookText}
            description="Summarize your notes efficiently by entering text or uploading PDF or DOCX file."
            href="/notes-summarizer"
            cta="Summarize Notes"
          />
          <BentoCard
            name="Visuals Generator"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-green-100 h-full" />}
            Icon={ChartColumn}
            description="Create Charts, Graphs from your text prompts with AI assistance."
            href="/visuals-generator"
            cta="Generate Visuals"
          />
          <BentoCard
            name="Study Club"
            className="col-span-3 sm:col-span-1"
            background={<div className="bg-green-100 h-full" />}
            Icon={Home}
            description="Join or create a study group with your friends. Video calls, chat, and more."
            href="/study-club"
            cta="Join Study Club"
          />
          
        </BentoGrid>
      </Suspense>
    </div>
  );
}
