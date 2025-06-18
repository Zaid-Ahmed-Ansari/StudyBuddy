import GenAiChat from '@/components/genai-chat'
import GenAISidebar from '@/components/genaiSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notes Generator | StudyBuddy',
  description: 'Generate and manage your study notes with AI assistance.',
};

export default async function NotePage(props: {
  params: Promise<{ userId: string; chatId: string }>
}) {
  const { userId, chatId } = await props.params
  return (
    <div className='md:pt-0 pt-12'>
    <GenAiChat chatId={chatId} userId={userId}/>
    <GenAISidebar/>
    </div>
  );
} 