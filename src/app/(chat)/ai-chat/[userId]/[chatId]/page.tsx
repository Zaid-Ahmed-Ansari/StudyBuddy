import AiChat from '@/components/ai-chat'
import ChatSidebar from '@/components/chatSidebar'
import React from 'react'

export default async function Page ({params}: {params:{chatId: string,userId: string}}) {
  const { chatId, userId } = await params;

  return (
    <div>
      <AiChat chatId={chatId} userId={userId}/>
      <ChatSidebar/>
    </div>
  )
}


