"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoaderSkeleton from "./LoaderSkeleton";
import ProgressBar from "./ProgressBar";
import StageDialog from "./StageDialog";
import RecommendationReveal from "./RecommendationReveal";
import {
  generateSchedule,
  activeStageIndex,
  progressForElapsed,
  stageProgress,
  type LoaderSchedule,
} from "@/lib/loader-math";
import { LOADER_STAGES, pickStageStrings } from "@/lib/copy-strings";
import type { LiveProduct } from "@/lib/types";

type LoaderPhase = "searching" | "revealing";

interface LoaderScreenProps {
  /** Phase to render. */
  phase: LoaderPhase;
  /** Whether real backend data has arrived. Only meaningful while searching. */
  dataArrived: boolean;
  /** When phase transitions to revealing, this MUST be the recommended product. */
  product: LiveProduct | null;
  /** Triggered when fake schedule + data are both done — parent should switch phase to 'revealing'. */
  onScheduleComplete: () => void;
  /** Bubble up to parent when user clicks See all options. */
  onSeeAllOptions: () => void;
  /** Bubble up the Agent checkout tease. */
  onAgentCheckout: () => void;
}

const TICK_MS = 80;

export default function LoaderScreen({
  phase,
  dataArrived,
  product,
  onScheduleComplete,
  onSeeAllOptions,
  onAgentCheckout,
}: LoaderScreenProps) {
  // Stable schedule + picked strings per run. Re-roll when phase enters 'searching'.
  const scheduleRef = useRef<LoaderSchedule | null>(null);
  const stringsRef = useRef<string[] | null>(null);
  const startTimeRef = useRef<number | null>(null);
  if (!scheduleRef.current) scheduleRef.current = generateSchedule();
  if (!stringsRef.current) stringsRef.current = pickStageStrings();
  if (startTimeRef.current === null) startTimeRef.current = performance.now();

  const [elapsed, setElapsed] = useState(0);
  const [scheduleDoneFired, setScheduleDoneFired] = useState(false);

  // Tick clock while searching.
  useEffect(() => {
    if (phase !== "searching") return;
    const id = window.setInterval(() => {
      const now = performance.now();
      const e = (now - (startTimeRef.current ?? now)) / 1000;
      setElapsed(e);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  // Fire schedule-complete callback when both: (a) data arrived, AND (b) schedule done.
  useEffect(() => {
    if (phase !== "searching" || scheduleDoneFired) return;
    if (!scheduleRef.current) return;
    const total = scheduleRef.current.total;
    if (elapsed >= total && dataArrived) {
      setScheduleDoneFired(true);
      onScheduleComplete();
    }
  }, [elapsed, dataArrived, phase, scheduleDoneFired, onScheduleComplete]);

  const schedule = scheduleRef.current!;
  const strings = stringsRef.current!;

  const idx = useMemo(
    () => activeStageIndex(elapsed, schedule),
    [elapsed, schedule]
  );

  const progress = useMemo(
    () => progressForElapsed(elapsed, schedule, dataArrived || phase === "revealing"),
    [elapsed, schedule, dataArrived, phase]
  );

  const counter = useMemo(() => {
    const stage = LOADER_STAGES[idx];
    const t = stageProgress(elapsed, idx, schedule);
    return stage.counter(t);
  }, [elapsed, idx, schedule]);

  const isRevealing = phase === "revealing";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center gap-8">
      <AnimatePresence mode="wait">
        {!isRevealing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col items-center gap-6"
          >
            <LoaderSkeleton />
            <ProgressBar value={progress} snap={dataArrived && elapsed >= schedule.total} />
            <StageDialog
              activeIndex={idx}
              pickedStrings={strings}
              activeCounter={counter}
            />
          </motion.div>
        ) : (
          product && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-full"
            >
              <RecommendationReveal
                product={product}
                onSeeAllOptions={onSeeAllOptions}
                onAgentCheckout={onAgentCheckout}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
