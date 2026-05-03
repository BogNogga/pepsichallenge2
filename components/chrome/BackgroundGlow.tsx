"use client";

import { motion } from "framer-motion";

export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Top-left corner glow */}
      <motion.div
        aria-hidden
        className="absolute -top-[30vh] -left-[30vh] h-[90vh] w-[90vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(125,223,242,0.28) 0%, rgba(125,223,242,0.10) 40%, rgba(125,223,242,0) 70%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.85, 1.0, 0.85] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bottom-right corner glow */}
      <motion.div
        aria-hidden
        className="absolute -bottom-[30vh] -right-[30vh] h-[90vh] w-[90vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(125,223,242,0.22) 0%, rgba(125,223,242,0.08) 40%, rgba(125,223,242,0) 70%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.95, 0.8, 0.95] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
