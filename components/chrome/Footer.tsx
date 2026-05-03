"use client";

import { motion } from "framer-motion";

const LINKS = ["Privacy", "Terms", "Feedback"] as const;

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 px-6 py-4">
      <div className="mx-auto max-w-[1700px] flex items-center justify-between text-xs text-text-secondary/70">
        <span>© 2026 Agent</span>
        <div className="flex items-center gap-5">
          {LINKS.map((label) => (
            <motion.button
              key={label}
              type="button"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03, color: "#FAFAFA" }}
              transition={{ duration: 0.15 }}
              className="hover:text-text-primary transition-colors"
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </footer>
  );
}
