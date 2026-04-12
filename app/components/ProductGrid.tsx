"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { LiveProduct } from "@/lib/types";
import AIThinking from "./AIThinking";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: LiveProduct[];
  summary: string;
  isLoading: boolean;
  streamedSummary: string;
  onCheckout?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function SkeletonProductCard() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden">
      <div className="aspect-video shimmer-bg" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg shimmer-bg" />
        <div className="h-4 w-1/3 rounded-lg shimmer-bg" />
        <div className="h-7 w-1/4 rounded-lg shimmer-bg" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full rounded-lg shimmer-bg" />
          ))}
        </div>
        <div className="h-11 w-full rounded-xl shimmer-bg mt-4" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  summary,
  isLoading,
  streamedSummary,
  onCheckout,
}: ProductGridProps) {
  const { totalItems } = useCart();

  const isStreaming = !summary && streamedSummary.length > 0;
  const displaySummary = summary || streamedSummary;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-8">
          <AIThinking message="Searching the web for the best products..." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {!isLoading && displaySummary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface rounded-2xl p-6 mb-8"
        >
          <p className="text-text-primary leading-relaxed">
            {displaySummary}
            {isStreaming && (
              <span className="typewriter-cursor" />
            )}
          </p>
        </motion.div>
      )}

      {/* Product grid */}
      {!isLoading && products.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Continue to checkout */}
      {!isLoading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex justify-center mt-10"
        >
          <Button
            disabled={totalItems === 0}
            onClick={onCheckout}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8 h-12 text-base font-semibold disabled:opacity-40 transition-all"
          >
            Continue to checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
