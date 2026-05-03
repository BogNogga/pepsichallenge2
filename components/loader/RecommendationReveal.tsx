"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTypewriter } from "@/lib/use-typewriter";
import type { LiveProduct } from "@/lib/types";
import HeroProductCard from "@/components/HeroProductCard";

interface RecommendationRevealProps {
  product: LiveProduct;
  onSeeAllOptions: () => void;
  onAgentCheckout: () => void;
}

/**
 * Reveal phase. Mounts when phase === 'revealing'. Steps:
 * 1. Skeleton dialog/progress already faded by parent.
 * 2. Hero card morphs in (filled product, glowing).
 * 3. Typewriter sentence above the card (35 cps).
 * 4. After typing finishes, the two buttons fade and rise in.
 *
 * Hero card uses layoutId="hero-recommendation" so it morphs on
 * the way in (from skeleton position) and on the way out (to grid hero position).
 */
export default function RecommendationReveal({
  product,
  onSeeAllOptions,
  onAgentCheckout,
}: RecommendationRevealProps) {
  const sentence = `${product.name} is the #1 choice based on your preferences`;
  const typed = useTypewriter(sentence, 9);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (typed.length >= sentence.length && !showButtons) {
      const t = window.setTimeout(() => setShowButtons(true), 200);
      return () => window.clearTimeout(t);
    }
  }, [typed, sentence, showButtons]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Reveal sentence above card */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-xl md:text-2xl text-text-primary text-center font-medium tracking-tight max-w-2xl px-4"
      >
        {typed}
        {typed.length < sentence.length && <span className="typewriter-cursor" />}
      </motion.p>

      {/* Hero card — same layoutId as the skeleton so it morphs in. */}
      <motion.div
        initial={{ scale: 1.0, y: 0 }}
        animate={{ scale: 1.05, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        className="w-full"
      >
        <HeroProductCard product={product} variant="reveal" />
      </motion.div>

      {/* Buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center gap-3 mt-4"
          >
            <button
              type="button"
              onClick={onAgentCheckout}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border-subtle hover:border-text-secondary/40 hover:text-text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Agent checkout
              </span>
            </button>
            <Button
              onClick={onSeeAllOptions}
              className="bg-accent hover:bg-accent/90 text-white rounded-xl px-6 h-11 text-sm font-semibold transition-all"
            >
              See all options
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
