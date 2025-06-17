'use client';

import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useState } from "react";

const MeetingSetup = ({
  user,
  setIsSetupComplete,
  setMicOff,
  setCamOff,
}: {
  user: { id: string; name: string; image: any };
  setIsSetupComplete: (value: boolean) => void;
  setMicOff: (off: boolean) => void;
  setCamOff: (off: boolean) => void;
}) => {
  const call = useCall();
  const [isMicToggledOff, setIsMicToggledOff] = useState(false);
  const [isCamToggledOff, setIsCamToggledOff] = useState(false);

  if (!call) throw new Error("Call not found");

  useEffect(() => {
    if (isMicToggledOff) {
      call.microphone.disable();
    } else {
      call.microphone.enable();
    }
    setMicOff(isMicToggledOff);
  }, [isMicToggledOff]);

  useEffect(() => {
    if (isCamToggledOff) {
      call.camera.disable();
    } else {
      call.camera.enable();
    }
    setCamOff(isCamToggledOff);

    return () => {
      call.camera.disable(); // Cleanup
    };
  }, [isCamToggledOff]);

  return (
    <div className="min-h-screen w-full px-4 py-6 flex flex-col md:flex-row items-center justify-center gap-8 text-white">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-center">Meeting Setup</h1>

        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-md">
          {isCamToggledOff ? (
            <span className="text-white text-5xl font-semibold">
              {user.name.charAt(0)}
            </span>
          ) : (
            <VideoPreview />
          )}
        </div>

        <button
          className="mt-4 w-full rounded-md bg-accent px-6 py-3 text-white font-semibold hover:bg-accent/90 transition"
          onClick={() => setIsSetupComplete(true)}
        >
          Join Call
        </button>
      </div>

      <div className="flex md:flex-col items-center gap-6">
        {/* Camera Toggle */}
        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setIsCamToggledOff(!isCamToggledOff)}
                className={cn(
                  'p-3 rounded-full border transition',
                  isCamToggledOff
                    ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200'
                )}
              >
                {isCamToggledOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              className="bg-black text-white text-xs px-2 py-1 rounded-md shadow"
            >
              {isCamToggledOff ? 'Camera is off' : 'Camera is on'}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

        {/* Mic Toggle */}
        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setIsMicToggledOff(!isMicToggledOff)}
                className={cn(
                  'p-3 rounded-full border transition',
                  isMicToggledOff
                    ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200'
                )}
              >
                {isMicToggledOff ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side="top"
              sideOffset={6}
              className="bg-black text-white text-xs px-2 py-1 rounded-md shadow"
            >
              {isMicToggledOff ? 'Mic is off' : 'Mic is on'}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

        <DeviceSettings />
      </div>
    </div>
  );
};

export default MeetingSetup;
