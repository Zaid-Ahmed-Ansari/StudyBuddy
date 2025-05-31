import AiChat from '@/components/ai-chat'
import ChatSidebar from '@/components/chatSidebar'
import React from 'react'
interface PageProps {
  params: {
    chatId: string
    userId: string
  }
}
export default async function Page ({params}: PageProps) {
  const { chatId, userId } =  params;

  return (
    <div>
      <AiChat chatId={chatId} userId={userId}/>
      <ChatSidebar/>
    </div>
  )
}


