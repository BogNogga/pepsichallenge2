"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/lib/use-typewriter";

export type BulletState = "pending" | "active" | "done";

interface StageBulletProps {
  state: BulletState;
  label: string;
  /** Active-state status string (typed in). Only rendered when state === 'active'. */
  statusString: string;
  /** Counter rendered to the right of the line when active. */
  counter: string;
}

export default function StageBullet({
  state,
  label,
  statusString,
  counter,
}: StageBulletProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex items-center gap-3 min-w-0">
        <Marker state={state} />
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm transition-colors",
              state === "done" && "text-text-secondary line-through decoration-text-secondary/40",
              state === "active" && "text-text-primary font-medium",
              state === "pending" && "text-text-secondary/60"
            )}
          >
            {label}
          </p>
          {state === "active" && statusString && (
            <ActiveStatus text={statusString} />
          )}
        </div>
      </div>

      {state === "active" && counter && (
        <motion.span
          key={`counter-${counter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-text-secondary tabular-nums whitespace-nowrap"
        >
          {counter}
        </motion.span>
      )}
    </div>
  );
}

function Marker({ state }: { state: BulletState }) {
  if (state === "done") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/40">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <motion.span
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(6,182,212,0.7)]"
      />
    );
  }
  return <span className="block h-2 w-2 rounded-full bg-text-secondary/30 ml-[2px]" />;
}

function ActiveStatus({ text }: { text: string }) {
  // ~12 cps for loader busy strings (slow theatre).
  const typed = useTypewriter(text, 12);
  return (
    <p className="text-xs text-text-secondary mt-0.5">
      {typed}
      <span className="typewriter-cursor" />
    </p>
  );
}
