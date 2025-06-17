'use client';

import {
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
  CallControls,
} from '@stream-io/video-react-sdk';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  LayoutList,
  Users,
} from 'lucide-react';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = ({ onLeave }: { onLeave: () => void }) => {
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);

  const call = useCall();
  const { useHasOngoingScreenShare } = useCallStateHooks();
  const isSomeoneScreenSharing = useHasOngoingScreenShare();

  const handleLeaveCall = async () => {
    try {
      if (call) {
        // Force disable devices first
        try {
          // Disable microphone
          if (call.microphone.state.status === 'enabled') {
            await call.microphone.disable();
          }
          // Disable camera
          if (call.camera.state.status === 'enabled') {
            await call.camera.disable();
          }
        } catch (error) {
          console.error('Error disabling devices:', error);
        }
        
        // Then leave the call
        await call.leave();
      }
    } catch (error) {
      console.error('Error leaving call', error);
    } finally {
      onLeave();
    }
  };

  const CallLayout = () => {
    switch (layout) {
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="right" />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <PaginatedGridLayout />;
    }
  };

  return (
    <section className="relative min-h-screen w-full bg-background text-white overflow-hidden flex flex-col">
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-[1400px] p-2 sm:p-4 h-full overflow-hidden">{CallLayout()}</div>

        <div
          className={cn(
            'fixed right-0 top-0 h-full w-full max-w-[320px] p-3 bg-background/90 backdrop-blur-md transition-transform duration-300 ease-in-out z-30',
            showParticipants ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full shadow-md flex  items-center gap-3 sm:gap-4 max-w-[95vw]">
        <CallControls 
          onLeave={handleLeaveCall}
        />

        <div className="h-6 w-[1px] bg-white/20" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <LayoutList size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background/95">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, i) => (
              <div key={i}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                  className="cursor-pointer hover:bg-background/70"
                >
                  {item}
                </DropdownMenuItem>
                {i < 2 && <DropdownMenuSeparator />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-[1px] bg-white/20" />

        <CallStatsButton />

        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full text-white hover:bg-white/10 transition-colors",
            showParticipants && "bg-white/10"
          )} 
          onClick={() => setShowParticipants((prev) => !prev)}
        >
          <Users size={20} />
        </Button>
      </div>
    </section>
  );
};

export default MeetingRoom;
