"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AgentCheckoutTeaseProps {
  open: boolean;
  onClose: () => void;
}

export default function AgentCheckoutTease({ open, onClose }: AgentCheckoutTeaseProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-accent/30 rounded-2xl p-8 max-w-md text-center shadow-2xl glow-accent"
          >
            <div className="mx-auto mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent/15 border border-accent/40 text-accent">
              <Sparkles className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">
              Coming soon
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The agent will complete the purchase autonomously — finding the best price,
              applying any deals, and checking out for you.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-medium text-text-primary border border-border-subtle hover:border-accent/40 transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
