'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AiChat from './ai-chat';


export default function ChatContainer() {
  const [chatStarted, setChatStarted] = useState(false);

  return (
    <div className="h-screen w-full  text-white mt-10 px-4 transition-all duration-500">
      <AnimatePresence>
        {!chatStarted && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-5"
          >
            <motion.h1 className="text-4xl font-bold text-accent/70">
              Welcome Student
            </motion.h1>
            <motion.p className="text-lg text-gray-300">
            What can I do for you today?
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChatStarted(true)}
              className="bg-accent hover:bg-accent/70 text-white px-6 py-2 rounded-full shadow-md"
            >
              Start Chat
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatStarted && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <AiChat />
            {/* <Multimodal /> // Uncomment if needed */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
