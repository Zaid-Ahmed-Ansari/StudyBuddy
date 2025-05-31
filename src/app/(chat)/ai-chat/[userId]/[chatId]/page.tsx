// src/app/(chat)/ai-chat/[userId]/[chatId]/page.tsx

import React from 'react'
import AiChat from '@/components/ai-chat'
import ChatSidebar from '@/components/chatSidebar'

type Props = {
  params: {
    userId: string
    chatId: string
  }
}

export default async function Landing({ params }: Props) {
  const { userId, chatId } = params

  return (
    <div>
      <AiChat userId={userId} chatId={chatId} />
      <ChatSidebar />
    </div>
  )
}
