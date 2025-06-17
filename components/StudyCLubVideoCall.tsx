'use client';

import {
  StreamCall,
  StreamTheme,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useCallStore } from '@/src/store/useCallStore';
import { useInitStreamCall } from '@/hooks/useInitStreamCall';
import MeetingSetup from './MeetingSetup';
import MeetingRoom from './MeetingRoom';
import { Loader } from './loader';
import { Button } from './ui/button';

const StudyCLubVideoCall = ({
  apiKey,
  token,
  user,
  callId,
  onClose,
  minimizeOnClose = false,
}) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const {
    call,
    client,
    
    
    setCall,
    setClient,
  } = useCallStore();

  // Initialize only once per mount (handles refresh rejoin)
  useInitStreamCall({ apiKey, token, user, callId });

  useEffect(() => {
    const joinCall = async () => {
      if (isSetupComplete && call && !hasJoined) {
        try {
          await call.join();
          // Only enable devices if we have permission
          if (micOff) {
            await call.microphone.disable();
          } else {
            try {
              await call.microphone.enable();
            } catch (err) {
              console.error('Error enabling microphone:', err);
              setMicOff(true); // Set mic as off if we can't enable it
            }
          }
          if (camOff) {
            await call.camera.disable();
          } else {
            try {
              await call.camera.enable();
            } catch (err) {
              console.error('Error enabling camera:', err);
              setCamOff(true); // Set camera as off if we can't enable it
            }
          }
          setHasJoined(true);
        } catch (err) {
          console.error('Join failed', err);
        }
      }
    };
    joinCall();
  }, [isSetupComplete, call, hasJoined, micOff, camOff]);

  const handleLeave = async () => {
    try {
      if (call) {
        // First disable devices
        try {
          await call.microphone.disable();
        } catch (err) {
          console.error('Error disabling microphone:', err);
        }
        try {
          await call.camera.disable();
        } catch (err) {
          console.error('Error disabling camera:', err);
        }
        // Then leave the call
        await call.leave();
      }
    } catch (err) {
      console.error('Error leaving call', err);
    } finally {
      setIsSetupComplete(false);
      setHasJoined(false);
      setMicOff(false);
      setCamOff(false);
      
      onClose();
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (call) {
        // First disable devices
        call.microphone.disable().catch(err => console.error('Error disabling microphone on unmount:', err));
        call.camera.disable().catch(err => console.error('Error disabling camera on unmount:', err));
        // Then leave the call
        call.leave().catch(err => console.error('Error leaving call on unmount:', err));
      }
    };
  }, [call]);

  if (!call || !client) return <Loader />;

  return (
    <main className="fixed bottom-0 right-0 w-full h-full z-40">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup
              user={user}
              setIsSetupComplete={setIsSetupComplete}
              setMicOff={setMicOff}
              setCamOff={setCamOff}
            />
          ) : (
            <MeetingRoom onLeave={handleLeave} />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default StudyCLubVideoCall;
