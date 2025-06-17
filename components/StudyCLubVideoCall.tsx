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

import { toast } from 'react-hot-toast';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [participants, setParticipants] = useState([]);

  const {
    call,
    client,
    setCall,
    setClient,
  } = useCallStore();

  // Initialize only once per mount (handles refresh rejoin)
  useInitStreamCall({ apiKey, token, user, callId });

  const disableDevices = async () => {
    if (!call) return;
    
    try {
      // Force disable microphone
      if (call.microphone.state.status === 'enabled') {
        await call.microphone.disable();
      }
      // Force disable camera
      if (call.camera.state.status === 'enabled') {
        await call.camera.disable();
      }
    } catch (err) {
      console.error('Error disabling devices:', err);
    }
  };

  const handleLeave = async () => {
    try {
      if (call) {
        // First disable devices
        await disableDevices();
        
        // Then leave the call
        await call.leave();
        
        // Disconnect the client
        if (client) {
          await client.disconnectUser();
        }
        
        // Reset all states
        setIsSetupComplete(false);
        setHasJoined(false);
        setMicOff(false);
        setCamOff(false);
        setCall(null);
        setClient(null);
      }
    } catch (err) {
      console.error('Error leaving call', err);
    } finally {
      onClose();
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (call) {
        disableDevices().then(() => {
          call.leave().then(() => {
            if (client) {
              client.disconnectUser();
            }
          }).catch(err => console.error('Error leaving call on unmount:', err));
        }).catch(err => console.error('Error in cleanup:', err));
      }
    };
  }, [call, client]);

  useEffect(() => {
    const joinCall = async () => {
      if (isSetupComplete && call && !hasJoined) {
        try {
          // Only join if not already joined
          if (!call.state.localParticipant) {
          await call.join();
          }
          
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
