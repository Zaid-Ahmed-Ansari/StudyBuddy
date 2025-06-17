"use client"

import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Loader2, Users, X, MessageCircle, Video, LayoutDashboard, Phone, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import ChatBox from '@/components/ChatBox'
import MembersList from '@/components/MembersList'
import { ChatProvider } from '@/components/ChatProvider'
import { tokenProvider } from '@/src/actions/stream.actions'
import StudyCLubVideoCall from '@/components/StudyCLubVideoCall'
import { StreamChat } from 'stream-chat'
import { Button } from '@/components/ui/button'

import StreamVideoProvider from '@/src/context/StreamVideoProvider'
import { useStreamVideoClient } from '@stream-io/video-react-sdk'

export default function StudyClubActivitiesPage() {
  const router = useRouter()
  const { partyCode } = useParams()
  const [chatToken, setChatToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [isMembersListOpen, setIsMembersListOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [hadActiveCall, setHadActiveCall] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  

  // Add club data state
  const [clubData, setClubData] = useState<{ expiresAt: string } | null>(null);
  

  // Only initialize user if session is available
  const userM = session?.user
  const userMemo = useMemo(() => {
    if (!userM) return null;

    return {
      id: userM.id,
      name: userM.username,
      image: `https://studybuddy.rest/api/avatar/${userM.username}`
    };
  }, [userM]);

  const fetchTokens = useCallback(async () => {
    if (!userMemo?.id) return
    
    try {
      // Fetch chat token
      const token = await tokenProvider()
      setChatToken(token)

      const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
      await client.connectUser(
        {
          id: userMemo.id,
          name: userMemo.name,
          image: userMemo.image
        },
        token
      );

      setUser(client.user);
    } catch (err) {
      console.error('Failed to fetch tokens:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to initialize')
    }
  }, [userMemo?.id])

  useEffect(() => {
    if (status === 'authenticated' && userMemo?.id) {
      fetchTokens()
    }
  }, [status, userMemo?.id, fetchTokens])

  // Fetch club data including expiration time
  const fetchClubData = useCallback(async () => {
    if (!partyCode || status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/study-club/${partyCode}/member`);
      if (response.ok) {
        const data = await response.json();
        setClubData(data);
        setIsAdmin(data.isAdmin);
      } else if (response.status === 401) {
        router.push('/auth/signin');
      } else if (response.status === 404) {
        router.push('/study-club');
      }
    } catch (err) {
      console.error('Error fetching club data:', err);
    }
  }, [partyCode, session, status, router]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  // Add time expiration check
  useEffect(() => {
    if (!clubData?.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expiresAt = new Date(clubData.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Club has expired');
        router.replace(`/study-club/${partyCode}`);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s remaining`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [clubData?.expiresAt, partyCode, router]);

  const client = useStreamVideoClient();
  const handleCallClose = async () => {
    try {
      if (client) {
        const call = client.call("default", String(partyCode));
        if (call) {
          // First disable devices
          try {
            if (call.microphone.state.status === 'enabled') {
              await call.microphone.disable();
            }
            if (call.camera.state.status === 'enabled') {
              await call.camera.disable();
            }
          } catch (error) {
            console.error('Error disabling devices:', error);
          }

          // Then leave the call
          await call.leave();
          
          // Finally disconnect the client
          await client.disconnectUser();
        }
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      setIsVideoOpen(false);
      setHadActiveCall(true);
    }
  };

  const createCall = async () => {
    const callId = String(partyCode);
    try {
      // Create a unique call ID for this study club
      const call = client.call("default", callId);
      if (!call) {
        throw new Error('Failed to create call');
      }

      try {
        // Try to get existing call
        await call.get();
      } catch (error) {
        // If call doesn't exist, create it
        await call.create();
      }
      
      // Set up call state
      setIsVideoOpen(true);
    } catch (error) {
      console.error('Error creating/joining call:', error);
      toast.error('Failed to join call. Please try again later.');
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        const call = client.call("default", String(partyCode));
        if (call) {
          // First disable devices
          Promise.all([
            call.microphone.state.status === 'enabled' ? call.microphone.disable() : Promise.resolve(),
            call.camera.state.status === 'enabled' ? call.camera.disable() : Promise.resolve()
          ]).then(() => {
            // Then leave the call
            call.leave().then(() => {
              // Finally disconnect the client
              client.disconnectUser();
            }).catch(err => console.error('Error leaving call on unmount:', err));
          }).catch(err => console.error('Error disabling devices on unmount:', err));
        }
      }
    };
  }, [client, partyCode]);

  const handleCallEnd = () => {
    setIsVideoOpen(false);
    setHadActiveCall(true);
  };

  const handleCallStart = () => {
    setIsVideoOpen(true);
    setHadActiveCall(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchClubData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === 'loading' || !userMemo || !chatToken) {
    return (
      <div className="fixed inset-0 flex items-center justify-center ">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Loading...</h2>
          <p className="text-gray-400">Please wait while we initialize your session.</p>
        </div>
      </div>
    )
  }

  return (
    
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          {!isVideoOpen && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-accent">Study Club Activities</h1>
                <p className="mt-2 text-sm text-gray-400">
                  Party Code: {partyCode}
                </p>
                {timeLeft && (
                  <p className="mt-1 text-sm text-gray-400">
                    {timeLeft}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
          
          {/* Main Content */}
          <div className={`h-full px-4 flex ${isVideoOpen ? 'items-stretch pt-10' : 'items-center pt-20'} justify-center`}>
  <div className={`w-full max-w-6xl ${isVideoOpen ? 'h-full' : 'h-[80vh]'}`}>
    {isVideoOpen  ? (
      <StudyCLubVideoCall
        apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY!}
        token={chatToken}
        user={userMemo}
        callId={String(partyCode)}
        minimizeOnClose={true}
        onClose={handleCallClose}
      />
    ) : (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <p className="text-gray-400 text-center">Welcome to your study club! Use the buttons below to interact with members.</p>
        
        <div className="bg-gray-800/50 p-4 rounded-lg max-w-2xl w-full">
          <h3 className="text-accent font-semibold mb-2">Important Guidelines:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Always end the call properly using the "End Call" button before closing the tab.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Ensure your microphone and camera permissions are granted before joining a call.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              If you experience any issues, try refreshing the page and rejoining the call.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Keep your browser tab open while in a call to maintain connection.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Use the chat feature for text communication if audio/video isn't working.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Use other services in your Dashboard tab.
            </li>
          </ul>
        </div>
      </div>
    )}
  </div>
</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="fixed bottom-4 inset-x-0 px-4 z-50">
  <div className="flex flex-wrap justify-between gap-2 md:justify-center md:gap-4">
    <button
      onClick={() => setIsMembersListOpen(true)}
      className="flex-1 min-w-[120px] md:flex-none p-3 bg-accent text-white rounded-lg shadow-lg hover:bg-accent/90 transition-colors"
    >
      <div className='flex gap-2 items-center justify-center'>
        <Users className="w-5 h-5" /> Members
      </div>
    </button>
    <button
      onClick={() => router.replace(`/study-club/${partyCode}`)}
      className="flex-1 min-w-[120px] md:flex-none p-3 bg-accent text-white rounded-lg shadow-lg hover:bg-accent/90 transition-colors"
    >
      <div className='flex gap-2 items-center justify-center'>
        <LayoutDashboard className="w-5 h-5" /> Dashboard
      </div>
    </button>
    {!isVideoOpen && (
      <button
        onClick={createCall}
        className="flex-1 min-w-[120px] md:flex-none p-3 bg-accent text-white rounded-lg shadow-lg hover:bg-accent/90 transition-colors"
      >
        <div className="flex gap-2 items-center justify-center">
          <Video className="w-5 h-5" /> Start Call
        </div>
      </button>
    )}
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className="flex-1 min-w-[120px] md:flex-none p-3 bg-accent text-white rounded-lg shadow-lg hover:bg-accent/90 transition-colors"
    >
      <div className="flex gap-2 items-center justify-center">
        <MessageCircle className="w-5 h-5" /> Chat
      </div>
    </button>
    { !isVideoOpen && hadActiveCall && (
      <button
        onClick={() => setIsVideoOpen(true)}
        className="flex-1 min-w-[120px] md:flex-none p-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors"
      >
        <div className="flex gap-2 items-center justify-center">
          <Phone className="w-5 h-5" /> Resume Call
        </div>
      </button>
    )}
  </div>
</div>


      {/* Members List Dialog */}
      <AnimatePresence>
        {isMembersListOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={() => setIsMembersListOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Members</h2>
                  <button
                    onClick={() => setIsMembersListOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  <MembersList isActivitiesPage={true} className="h-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-24 right-6 w-full max-w-md sm:w-96 h-[600px] bg-gray-900 rounded-lg shadow-xl overflow-hidden z-40"

          >
            <ChatProvider user={userMemo} token={chatToken}>
              <ChatBox isActivitiesPage={true} className="h-full" onClose={() => setIsChatOpen(false)} />
            </ChatProvider>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
    
  )
}

