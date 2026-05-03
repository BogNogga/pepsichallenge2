"use client";

import { motion } from "framer-motion";
import StageBullet, { type BulletState } from "./StageBullet";
import { LOADER_STAGES } from "@/lib/copy-strings";

interface StageDialogProps {
  /** Currently active stage index (0..6). */
  activeIndex: number;
  /** One status string per stage, picked at run start. */
  pickedStrings: string[];
  /** Counter text for the currently active stage. */
  activeCounter: string;
  /** Whether the dialog is fading out (during reveal). */
  fadingOut?: boolean;
}

export default function StageDialog({
  activeIndex,
  pickedStrings,
  activeCounter,
  fadingOut = false,
}: StageDialogProps) {
  return (
    <motion.div
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto bg-surface/40 border border-border-subtle/60 rounded-2xl p-5 backdrop-blur-sm"
    >
      <ul className="flex flex-col gap-1">
        {LOADER_STAGES.map((stage, i) => {
          const state: BulletState =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
          return (
            <li key={stage.label}>
              <StageBullet
                state={state}
                label={stage.label}
                statusString={state === "active" ? pickedStrings[i] : ""}
                counter={state === "active" ? activeCounter : ""}
              />
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
