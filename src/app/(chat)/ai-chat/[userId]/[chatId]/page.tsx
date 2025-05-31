// src/app/(chat)/ai-chat/[userId]/[chatId]/page.tsx

import AiChat from '@/components/ai-chat'
import ChatSidebar from '@/components/chatSidebar'

export default async function Page(props: {
  params: Promise<{ userId: string; chatId: string }>
}) {
  const { userId, chatId } = await props.params

  return (
    <div>
      <AiChat userId={userId} chatId={chatId} />
      <ChatSidebar />
    </div>
  )
}
