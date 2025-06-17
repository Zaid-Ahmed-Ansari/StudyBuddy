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
      reset: () => set({ client: null, call: null, isMinimized: false }),
    }),
    {
      name: 'video-call-store', // localStorage key
      partialize: (state) => ({
        isMinimized: state.isMinimized,
      }),
    }
  )
);
