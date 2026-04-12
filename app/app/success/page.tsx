"use client";

import { motion } from "framer-motion";
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export default function SuccessPage() {
  const { clearCart } = useCart();

  const handleReset = () => {
    clearCart();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-8"
        >
          <CheckCircle className="h-20 w-20 text-accent mx-auto" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
        >
          Payment successful
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-text-secondary text-lg mb-2"
        >
          This was a test mode transaction.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="text-text-secondary/60 text-sm mb-10"
        >
          No real payment was processed. Your card was not charged.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <Button
            onClick={handleReset}
            className="bg-accent hover:bg-accent/90 text-white rounded-xl px-8 h-12 text-base font-semibold transition-all"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start new demo
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
