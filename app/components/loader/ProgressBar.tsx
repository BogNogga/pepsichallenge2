"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  /** When the loader snaps to 100% on reveal, transition is faster than the live tick. */
  snap?: boolean;
}

export default function ProgressBar({ value, snap = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="w-full max-w-2xl mx-auto h-1.5 rounded-full bg-surface border border-border-subtle/50 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-accent shadow-[0_0_12px_rgba(6,182,212,0.6)]"
        animate={{ width: `${pct}%` }}
        transition={{
          duration: snap ? 0.25 : 0.4,
          ease: snap ? "easeOut" : "linear",
        }}
      />
    </div>
  );
}
