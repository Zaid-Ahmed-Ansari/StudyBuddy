// src/app/(chat)/ai-chat/[userId]/[chatId]/page.tsx

import AiChat from '@/components/ai-chat'
import ChatSidebar from '@/components/chatSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Study Chat | Interactive Learning Session | StudyBuddy',
  description: 'Engage in an interactive learning session with our AI study assistant. Get personalized help, explanations, and guidance for your academic questions.',
  keywords: 'AI study chat, interactive learning, personalized study help, academic assistance, study session',
  openGraph: {
    title: 'AI Study Chat | Interactive Learning Session | StudyBuddy',
    description: 'Engage in an interactive learning session with our AI study assistant. Get personalized help, explanations, and guidance for your academic questions.',
    url: 'https://studybuddy.rest/ai-chat',
  },
  alternates: {
    canonical: 'https://studybuddy.rest/ai-chat',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StudyBuddy AI Study Chat',
  description: 'Interactive learning session with AI study assistant for personalized academic help',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'Interactive chat interface',
    'Real-time responses',
    'Context-aware assistance',
    'Subject-specific help',
    'Learning progress tracking',
    'Chat history preservation'
  ],
  url: 'https://studybuddy.rest/ai-chat',
  author: {
    '@type': 'Person',
    name: 'Zaid Ahmed Ansari'
  }
}

export default async function Page(props: {
  params: Promise<{ userId: string; chatId: string }>
}) {
  const { userId, chatId } = await props.params

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className='md:pt-0 pt-12 '>
        <AiChat userId={userId} chatId={chatId} />
        <ChatSidebar />
      </div>
    </>
  )
}
