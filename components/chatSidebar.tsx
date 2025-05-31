// components/ChatSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  Menu,
  ChevronLeft,
  Search,
} from "lucide-react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { nanoid } from "nanoid";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export default function ChatSidebar({
  currentChatId,
  onChatSelect,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const pathname = usePathname();

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Handle redirection after chats are loaded - but only once
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);

      // Only handle redirection if we're on the base /ai-chat path (not on a specific chat)
      if (pathname === "/ai-chat" || pathname === "/ai-chat/") {
        if (chats.length > 0) {
          // If there are chats, redirect to the first one
          router.replace(`/ai-chat/${chats[0]._id}`);
        }
        // If no chats exist, stay on /ai-chat (new chat page)
      }
    }
  }, [isLoading, chats, pathname, router, hasInitialized]);

  // Watch for when chats become empty and redirect
  useEffect(() => {
    if (!isLoading && hasInitialized && chats.length === 0) {
      // If there are no chats and we're not on the base path, redirect to /ai-chat
      if (pathname !== "/ai-chat" && pathname !== "/ai-chat/") {
        router.replace(`/ai-chat/${user?.id}`);
      }
    }
  }, [chats.length, isLoading, hasInitialized, pathname, router]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chat/${user?.id}/list`);
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch(`/api/chat/${user?.id}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }), // optional: pass custom title here
      });

      const data = await res.json();

      if (data?.success && data?.chat?._id) {
        router.push(`/ai-chat/${user?.id}/${data.chat._id}`);
      } else {
        console.error("Failed to create chat:", data?.message);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!chatToDelete) {
      return;
    }

    try {
      const response = await axios.delete(`/api/chat/${user?.id}/${chatId}`);
      if (response.data.success) {
        const updatedChats = chats.filter((chat) => chat._id !== chatId);
        setChats(updatedChats);

        // If we deleted the current chat, redirect appropriately
        if (currentChatId === chatId) {
          if (updatedChats.length > 0) {
            // If there are remaining chats, go to the first one
            router.replace(`/ai-chat/${user?.id}/${updatedChats[0]._id}`);
          } else {
            // If no chats left, go to the start new chat page
            router.replace(`/ai-chat/${user?.id}`);
          }
        }
        // If we're not on the deleted chat but there are no chats left,
        // the useEffect above will handle the redirection
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setChatToDelete(null);
    }
  };

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const saveTitle = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const response = await axios.patch(
        `/api/chat/${user?.id}/${chatId}/title`,
        {
          title: editTitle.trim(),
        }
      );

      if (response.data.success) {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, title: editTitle.trim() } : chat
          )
        );
      }
    } catch (error) {
      console.error("Failed to update chat title:", error);
    } finally {
      setEditingId(null);
      setEditTitle("");
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleChatSelect = (chatId: string) => {
    // Prevent selecting the same chat
    if (chatId === currentChatId) return;

    if (onChatSelect) {
      onChatSelect(chatId);
    } else {
      router.push(`/ai-chat/${user?.id}/${chatId}`);
    }
  };

  // Filter chats based on search term
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 0 : 320 }}
        className={`fixed right-0 top-0 h-full border-r border-gray-700 z-50 overflow-hidden ${
          isCollapsed ? "lg:w-0" : "lg:w-80"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Chats</h2>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={createNewChat}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-4 py-3 bg-accent hover:bg-accent/70 disabled:bg-accent/80 rounded-lg transition-colors text-white font-medium"
            >
              <Plus size={20} />
              {isCreating ? "Creating..." : "New Chat"}
            </button>

            {/* Search - only show if there are chats */}
            {chats.length > 0 && (
              <div className="mt-3 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-4">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-14 bg-gray-800 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? (
                  <>
                    <p className="mb-2">No chats found</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                    >
                      Clear search
                    </button>
                  </>
                ) : chats.length === 0 ? (
                  <div className="space-y-3">
                    <MessageSquare
                      size={48}
                      className="mx-auto text-gray-600"
                    />
                    <p>No chats yet</p>
                    <p className="text-sm">
                      Click "New Chat" above to start your first conversation!
                    </p>
                  </div>
                ) : (
                  "No chats match your search"
                )}
              </div>
            ) : (
              <div className="p-2">
                <AnimatePresence>
                  {[...filteredChats]
                    .sort((a, b) => {
                      if (!a.createdAt) return 1;
                      if (!b.createdAt) return -1;
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      ); // Oldest to newest
                    })
                    .map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`group mb-2 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                          currentChatId === chat._id
                            ? "bg-gray-800 border border-indigo-500"
                            : ""
                        }`}
                        onClick={() => handleChatSelect(chat._id)}
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare
                            size={16}
                            className="text-gray-400 mt-1 flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            {editingId === chat._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="flex-1 px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveTitle(chat._id);
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveTitle(chat._id);
                                  }}
                                  className="p-1 hover:bg-gray-600 rounded"
                                >
                                  <Check size={14} className="text-green-400" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEditing();
                                  }}
                                  className="p-1 hover:bg-gray-600 rounded"
                                >
                                  <X size={14} className="text-red-400" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-white text-sm font-medium truncate">
                                  {chat.title}
                                </h3>
                                <p className="text-gray-400 text-xs mt-1">
                                  {formatDate(chat.updatedAt)}
                                </p>
                              </>
                            )}
                          </div>

                          {editingId !== chat._id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => startEditing(chat, e)}
                                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                                title="Rename chat"
                              >
                                <Edit3 size={14} className="text-gray-400" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setChatToDelete(chat);
                                    }}
                                    className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                                    title="Delete chat"
                                  >
                                    <Trash2
                                      size={14}
                                      className="text-red-400"
                                    />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this chat?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. The chat{" "}
                                      <strong>{chatToDelete?.title}</strong>{" "}
                                      will be permanently removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setChatToDelete(null)}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => deleteChat(chat._id, e)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Toggle button for mobile */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </>
  );
}
