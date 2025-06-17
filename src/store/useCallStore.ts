import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Call, StreamVideoClient } from '@stream-io/video-react-sdk';

interface CallStore {
  client: StreamVideoClient | null;
  call: Call | null;
  isMinimized: boolean;
  setClient: (client: StreamVideoClient | null) => void;
  setCall: (call: Call | null) => void;
  setMinimized: (minimized: boolean) => void;
  reset: () => void;
}

export const useCallStore = create<CallStore>()(
  persist(
    (set) => ({
      client: null,
      call: null,
      isMinimized: false,
      setClient: (client) => set({ client }),
      setCall: (call) => set({ call }),
      setMinimized: (isMinimized) => set({ isMinimized }),
      reset: async () => {
        const state = useCallStore.getState();
        if (state.call) {
          try {
            // First disable devices
            if (state.call.microphone.state.status === 'enabled') {
              await state.call.microphone.disable();
            }
            if (state.call.camera.state.status === 'enabled') {
              await state.call.camera.disable();
            }
            // Then leave the call
            await state.call.leave();
          } catch (error) {
            console.error('Error cleaning up call:', error);
          }
        }
        if (state.client) {
          try {
            await state.client.disconnectUser();
          } catch (error) {
            console.error('Error disconnecting client:', error);
          }
        }
        set({ client: null, call: null, isMinimized: false });
      },
    }),
    {
      name: 'video-call-store', // localStorage key
      partialize: (state) => ({
        isMinimized: state.isMinimized,
      }),
    }
  )
);
