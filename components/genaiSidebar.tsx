"use client";

import { useState, useEffect, useRef } from "react";
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
  MoreVertical,
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
import { useIsMobile } from "@/hooks/use-mobile";

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface GenAISidebarProps {
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export default function GenAISidebar({
  currentChatId,
  onChatSelect,
}: GenAISidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside or on mobile scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      setTouchStartY(event.touches[0].clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY !== null) {
        const currentY = event.touches[0].clientY;
        const diff = Math.abs(currentY - touchStartY);
        if (diff > 10) {
          setActiveDropdown(null);
          setTouchStartY(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchStartY]);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Handle redirection after chats are loaded - but only once
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);

      // Only handle redirection if we're on the base /notes-generator path (not on a specific chat)
      if (pathname === "/notes-generator" || pathname === "/notes-generator/") {
        if (chats.length > 0) {
          // If there are chats, redirect to the first one
          router.replace(`/notes-generator/${user?.id}/${chats[0]._id}`);
        } else {
          // If no chats exist, create a new one
          createNewChat();
        }
      }
    }
  }, [isLoading, chats, pathname, router, hasInitialized]);

  // Watch for when chats become empty and redirect
  useEffect(() => {
    if (!isLoading && hasInitialized && chats.length === 0) {
      // If there are no chats and we're not on the base path, redirect to /notes-generator
      if (pathname !== "/notes-generator" && pathname !== "/notes-generator/") {
        router.replace(`/notes-generator/${user?.id}`);
      }
    }
  }, [chats.length, isLoading, hasInitialized, pathname, router]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/genai-chat/${user?.id}/list`);
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
      setIsCreating(true);
      const res = await fetch(`/api/genai-chat/${user?.id}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });

      const data = await res.json();

      if (data?.success && data?.chat?._id) {
        router.push(`/notes-generator/${user?.id}/${data.chat._id}`);
      } else {
        console.error("Failed to create chat:", data?.message);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!chatToDelete) {
      return;
    }

    try {
      const response = await axios.delete(`/api/genai-chat/${user?.id}/${chatId}`);
      if (response.data.success) {
        const updatedChats = chats.filter((chat) => chat._id !== chatId);
        setChats(updatedChats);

        // If we deleted the current chat, redirect appropriately
        if (currentChatId === chatId) {
          if (updatedChats.length > 0) {
            // If there are remaining chats, go to the first one
            router.replace(`/notes-generator/${user?.id}/${updatedChats[0]._id}`);
          } else {
            // If no chats left, go to the start new chat page
            router.replace(`/notes-generator/${user?.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setChatToDelete(null);
      setActiveDropdown(null);
    }
  };

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
    setActiveDropdown(null);
  };

  const saveTitle = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const response = await axios.patch(
        `/api/genai-chat/${user?.id}/${chatId}/title`,
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
      router.push(`/notes-generator/${user?.id}/${chatId}`);
    }
  };

  const toggleDropdown = (chatId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
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
      {isMobile && !isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      )}
      
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 right-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      {/* Overlay for collapsed sidebar */}
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
        animate={{ 
          width: isCollapsed ? 0 : isMobile ? '100vw' : 320,
          x: isCollapsed && isMobile ? '100%' : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed right-0 top-0 h-full border-r border-gray-700 z-50 overflow-hidden md:bg-transparent bg-gray-900 ${
          isCollapsed ? "lg:w-0" : "lg:w-80"
        } ${isMobile ? 'w-full' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Chats</h2>
              {isMobile && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              )}
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
                      );
                    })
                    .map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`group mb-2 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800 relative ${
                          currentChatId === chat._id
                            ? "bg-gray-800 border border-indigo-500"
                            : ""
                        } ${isMobile ? 'active:bg-gray-700' : ''}`}
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
                                <h3 className="text-white text-sm font-medium truncate pr-8">
                                  {chat.title}
                                </h3>
                                <p className="text-gray-400 text-xs mt-1">
                                  {formatDate(chat.updatedAt)}
                                </p>
                              </>
                            )}
                          </div>

                          {!editingId && (
                            <>
                              {/* Desktop actions */}
                              <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                              {/* Mobile 3-dots menu */}
                              <div className="md:hidden">
                                <button
                                  onClick={(e) => toggleDropdown(chat._id, e)}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  className="p-2 hover:bg-gray-700 active:bg-gray-600 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                  title="More options"
                                  aria-label="More options"
                                >
                                  <MoreVertical size={16} className="text-gray-400" />
                                </button>

                                <AnimatePresence>
                                  {activeDropdown === chat._id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-20 min-w-[140px] overflow-hidden"
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={(e) => startEditing(chat, e)}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 active:bg-gray-600 transition-colors"
                                        >
                                          <Edit3 size={16} />
                                          Rename
                                        </button>
                                        <div className="border-t border-gray-600" />
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setChatToDelete(chat);
                                              }}
                                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 active:bg-gray-600 transition-colors"
                                            >
                                              <Trash2 size={16} />
                                              Delete
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
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </>
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