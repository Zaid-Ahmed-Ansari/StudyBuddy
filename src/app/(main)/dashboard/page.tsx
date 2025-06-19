'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Save,
  CalendarDays,
  Bot,
  NotebookPen,
  NotebookText,
  ChartColumn,
  Home,
} from 'lucide-react';
import { Suspense } from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import { PinContainer } from '@/components/ui/3d-pin';

function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-48 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <div className="h-10 w-32 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-24 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-24 shadow-xl dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg dark:bg-gray-800 animate-pulse">
            <div className="h-6 w-3/4 shadow-xl border dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-1/2 shadow-xl border dark:bg-gray-700 rounded mb-4"></div>
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

  if (status === 'loading') return <DashboardLoading />;
  if (!user) return <p className="text-center py-20">Loading your dashboard...</p>;

  const features = [
    {
      name: 'Saved Responses',
      icon: <Save className="h-6 w-6 text-accent" />,
      desc: 'View and manage your saved AI responses.',
      href: '/saved-responses',
    },
    {
      name: 'Study Planner',
      icon: <CalendarDays className="h-6 w-6 text-accent" />,
      desc: 'Plan and track your goals with structured scheduling.',
      href: '/study-planner',
    },
    {
      name: 'AI Chatbot',
      icon: <Bot className="h-6 w-6 text-accent" />,
      desc: 'Your personal study assistant, powered by AI.',
      href: `/ai-chat/${user?.id}`,
    },
    {
      name: 'Notes Generator',
      icon: <NotebookPen className="h-6 w-6 text-accent" />,
      desc: 'Generate study notes by topic and subject input.',
      href: `/notes-generator/${user?.id}`,
    },
    {
      name: 'Notes Summarizer',
      icon: <NotebookText className="h-6 w-6 text-accent" />,
      desc: 'Summarize notes via text or uploaded files.',
      href: '/notes-summarizer',
    },
    {
      name: 'Visuals Generator',
      icon: <ChartColumn className="h-6 w-6 text-accent" />,
      desc: 'Turn prompts into charts, graphs, and visuals.',
      href: '/visuals-generator',
    },
    {
      name: 'Study Club',
      icon: <Home className="h-6 w-6 text-accent" />,
      desc: 'Join clubs for real-time video, chat, and collaboration.',
      href: '/study-club',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="flex flex-wrap sm:flex-row gap-4 items-start sm:items-center justify-between">
        <UserAvatar
          username={user.username}
          size={64}
          className="ring-2 ring-accent ring-offset-2 ring-offset-black shadow-lg"
        />

        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, <span className="text-accent">{user.username}</span> 👋
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Here&#39;s your StudyBuddy control center.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-accent hover:bg-accent/70 text-white rounded-md transition text-sm">
            Party Code: {user.partyCode}
          </button>
          <Link
            href={`/u/${user.id}`}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm"
          >
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-accent hover:bg-accent/70 text-white rounded-md transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <Suspense fallback={<DashboardLoading />}>
        <section className="grid grid-cols-1 md:grid-cols-2  mt-10">
          {features.map((item, idx) => (
            <PinContainer title={item.name} href={item.href} key={idx}>
              <Link
                href={item.href}
                className="group relative flex flex-col justify-between rounded-2xl   backdrop-blur-md hover:shadow-[0_0_30px_#c02bea55] transition-all duration-300 hover:-translate-y-1 p-6 space-y-4"
              >
                <div className="flex items-center ">
                  <div className="rounded-full  p-3">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                </div>
                <p className="text-sm text-neutral-300">{item.desc}</p>
                
              </Link>
            </PinContainer>
          ))}
        </section>
      </Suspense>
    </div>
  );
}
