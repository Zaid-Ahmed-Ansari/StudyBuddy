'use client';

import { useSession, signOut } from 'next-auth/react';
// Assuming Message interface is exported from here
import Link from 'next/link';
import {BentoGrid,BentoCard} from '@/components/ui/bento-grid';
import { Bookmark, Bot, ChartColumn, Home, NotebookPen, NotebookText } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  
  

  if (!user) return <p className="text-center py-20">Loading your dashboard...</p>;

  return (<>
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, <span className="text-accent">{user.username}</span> 👋</h1>
          <p className="text-gray-600 mt-1">Here&#39;s your StudyBuddy control center.</p>
        </div>
        <div>
        <button
          
          className="mt-4 sm:mt-0 px-4  py-2 bg-accent hover:bg-accent/70 text-white rounded-md transition"
          >
          Party Code: {user.partyCode}
        </button>
        <button
          
          className="mt-4 sm:mt-0 px-4 ml-2 mr-2  py-2 bg-accent  text-white rounded-md transition"
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

      {/* Features Section */}
      <BentoGrid className=''>
        <BentoCard
          name="Saved Responses"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-blue-100 h-full" />}
          Icon={Bookmark} // Replace with an icon component if needed
          description="View and manage your saved AI responses."
          href="/saved-responses"
          cta="View Saved"
        />
        <BentoCard
          name="AI Chat"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-green-100 h-full" />}
          Icon={Bot}// Replace with an icon component if needed
          description="Talk with your own Study Assistant."
          href="/ai-chat"
          cta="Visit your Buddy"
        />
        <BentoCard
          name="Visuals Generator"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-green-100 h-full" />}
          Icon={ChartColumn}// Replace with an icon component if needed
          description="Join or create a study group with your friends. Video call, chat, and more."
          href="/visuals-generator"
          cta="Generate Visuals"
          
        />
        <BentoCard
          name="Notes Generator"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-blue-100 h-full" />}
          Icon={NotebookPen} // Replace with an icon component if needed
          description="Generate notes by giving subject, and topic"
          href="/notes-generator"
          cta="Generate Notes"
        />
        <BentoCard
          name="Notes Summarizer"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-green-100 h-full" />}
          Icon={NotebookText}// Replace with an icon component if needed
          description="Summarize your notes efficiently by giving text or pdf or docx."
          href="/notes-summarizer"
          cta="Summarize Notes"
        />
       
        <BentoCard
          name="Study Club"
          className="col-span-3 sm:col-span-1"
          background={<div className="bg-green-100 h-full" />}
          Icon={Home}// Replace with an icon component if needed
          description="Join or create a study group with your friends. Video call, chat, and more."
          href="/study-club"
          cta="Join Study Club"
        />
        {/* Add more feature cards as needed */}
      </BentoGrid>

      
      
    </div>
    </>
  );
}

function FeatureCard({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href}>
      <div className="p-6 border rounded-lg hover:shadow-lg transition bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700">
        {/* <div className="text-3xl mb-2">{emoji}</div> */}
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
    </Link>
  );
}
