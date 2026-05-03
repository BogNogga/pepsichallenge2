"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LiveProduct } from "@/lib/types";
import ProductCard from "./ProductCard";
import HeroProductCard from "./HeroProductCard";
import { useTypewriter } from "@/lib/use-typewriter";

interface ProductGridProps {
  hero: LiveProduct;
  rest: LiveProduct[];
  summary: string;
  onFindOthers: () => void;
}

const SKELETON_HOLD_MS = 1600;

const grid = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cell = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function CardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-border-subtle/60">
      <div className="aspect-video shimmer-bg" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg shimmer-bg" />
        <div className="h-4 w-1/3 rounded-lg shimmer-bg" />
        <div className="h-7 w-1/4 rounded-lg shimmer-bg" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3.5 w-full rounded-lg shimmer-bg" />
          ))}
        </div>
        <div className="h-11 w-full rounded-xl shimmer-bg mt-4" />
      </div>
    </div>
  );
}

export default function ProductGrid({ hero, rest, summary, onFindOthers }: ProductGridProps) {
  const [skeletonDone, setSkeletonDone] = useState(false);
  const typedSummary = useTypewriter(skeletonDone ? summary : "", 40);

  useEffect(() => {
    const t = window.setTimeout(() => setSkeletonDone(true), SKELETON_HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-24">
      {/* AI summary */}
      <div className="min-h-[3rem] mb-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-text-primary text-base md:text-lg leading-relaxed max-w-3xl mx-auto"
        >
          {typedSummary}
          {skeletonDone && typedSummary.length < summary.length && (
            <span className="typewriter-cursor" />
          )}
        </motion.p>
      </div>

      {/* Hero */}
      <div className="mb-10">
        {!skeletonDone ? (
          <div className="max-w-3xl mx-auto">
            <CardSkeleton />
          </div>
        ) : (
          <HeroProductCard product={hero} variant="grid" />
        )}
      </div>

      {/* Rest grid: 2 cols */}
      {rest.length > 0 && (
        <motion.div
          variants={grid}
          initial="hidden"
          animate={skeletonDone ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {!skeletonDone
            ? Array.from({ length: Math.min(4, Math.max(2, rest.length)) }).map((_, i) => (
                <div key={i}>
                  <CardSkeleton />
                </div>
              ))
            : rest.map((product) => (
                <motion.div key={product.id} variants={cell}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </motion.div>
      )}

      {/* Find others — no-op show element */}
      {skeletonDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex justify-center mt-10"
        >
          <FindOthersButton onClick={onFindOthers} />
        </motion.div>
      )}
    </div>
  );
}

function FindOthersButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="px-5 py-2.5 text-sm text-text-secondary border border-border-subtle hover:border-text-secondary/40 hover:text-text-primary rounded-xl transition-colors"
    >
      Find others
    </motion.button>
  );
}
