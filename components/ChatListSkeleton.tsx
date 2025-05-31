import { motion } from 'framer-motion';

export default function ChatListSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="h-12 bg-gray-700 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
