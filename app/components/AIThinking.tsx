"use client";

import { motion } from "framer-motion";

interface AIThinkingProps {
  message: string;
}

export default function AIThinking({ message }: AIThinkingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface rounded-2xl p-6 flex items-center gap-4"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2.5 w-2.5 rounded-full bg-accent"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-text-secondary text-sm"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
