'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const FloatingCallContext = createContext<{
  showCall: boolean;
  setShowCall: (val: boolean) => void;
  callDetails: {
    callId: string;
    minimized: boolean;
  } | null;
  setCallDetails: (details: { callId: string; minimized: boolean } | null) => void;
}>({
  showCall: false,
  setShowCall: () => {},
  callDetails: null,
  setCallDetails: () => {},
});

export const FloatingCallProvider = ({ children }: { children: React.ReactNode }) => {
  const [showCall, setShowCall] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showCall') === 'true';
    }
    return false;
  });
  
  const [callDetails, setCallDetails] = useState<{ callId: string; minimized: boolean } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('callDetails');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Update localStorage when showCall changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!showCall) {
        // Clear call details when call is ended
        localStorage.removeItem('callDetails');
        setCallDetails(null);
      }
      localStorage.setItem('showCall', showCall.toString());
    }
  }, [showCall]);

  // Update localStorage when callDetails changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (callDetails) {
        localStorage.setItem('callDetails', JSON.stringify(callDetails));
      } else {
        localStorage.removeItem('callDetails');
      }
    }
  }, [callDetails]);

  return (
    <FloatingCallContext.Provider value={{ showCall, setShowCall, callDetails, setCallDetails }}>
      {children}
    </FloatingCallContext.Provider>
  );
};

export const useFloatingCall = () => {
  const context = useContext(FloatingCallContext);
  if (!context) {
    throw new Error('useFloatingCall must be used within a FloatingCallProvider');
  }
  return context;
};
