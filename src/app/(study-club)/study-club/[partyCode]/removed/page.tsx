'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const MemberRemovedPage = () => {
  const router = useRouter();
  const params = useParams();
  const partyCode = params.partyCode;

  return (
    <div className="min-h-screen border shadow-xl  flex items-center justify-center px-4">
      <div className="max-w-md w-full border shadow-xl  rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-accent mb-2">
          Access Removed
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          You are no longer a member of this study club.
        </p>
        
        <div className="border shadow-xl rounded-lg p-3 mb-6">
          <p className="text-sm text-accent">
            Party Code: <span className="font-mono font-medium">{partyCode}</span>
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          If you believe this is an error, please contact the club administrator.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-accent/60 text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors font-medium"
          >
            Go to Homepage
          </button>
          
          <button
            onClick={() => router.push('/study-club')}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Join other clubs!
          </button>
        </div>

       
      </div>
    </div>
  );
};

export default MemberRemovedPage;