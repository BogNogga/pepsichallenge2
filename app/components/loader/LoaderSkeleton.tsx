"use client";

import { motion } from "framer-motion";

interface LoaderSkeletonProps {
  /** When true, suppresses inner shimmer to prepare for content fill-in. */
  filling?: boolean;
}

/**
 * Single product-card-sized skeleton with a traveling cyan dot border.
 * Mounted once during the loading phase, then morphs into the recommended
 * product card via shared layoutId="hero-recommendation".
 */
export default function LoaderSkeleton({ filling = false }: LoaderSkeletonProps) {
  return (
    <motion.div
      layoutId="hero-recommendation"
      transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
      className="relative w-full max-w-md mx-auto rounded-2xl bg-surface border border-border-subtle traveling-border overflow-hidden"
    >
      <div className="aspect-video shimmer-bg" style={{ opacity: filling ? 0.2 : 1 }} />
      <div className="p-6 space-y-3">
        <div className="h-5 w-3/4 rounded-lg shimmer-bg" style={{ opacity: filling ? 0.2 : 1 }} />
        <div className="h-4 w-1/3 rounded-lg shimmer-bg" style={{ opacity: filling ? 0.2 : 1 }} />
        <div className="h-7 w-1/4 rounded-lg shimmer-bg" style={{ opacity: filling ? 0.2 : 1 }} />
      </div>
    </motion.div>
  );
}
