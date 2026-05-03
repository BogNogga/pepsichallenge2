/**
 * Math for the 7-stage loader theatre.
 * Spec: total = uniform(55, 60); per-stage = uniform(8, 16) normalized to total.
 * Progress is bounded by `(elapsed / total) * 0.95` while waiting on real data.
 */

export type LoaderSchedule = {
  total: number; // seconds
  stageDurations: number[]; // length 7, sums to total
  stageBoundaries: number[]; // cumulative seconds at end of each stage; length 7
};

export function generateSchedule(): LoaderSchedule {
  const total = 55 + Math.random() * 5; // uniform(55, 60)
  const raw = Array.from({ length: 7 }, () => 8 + Math.random() * 8); // uniform(8, 16)
  const sumRaw = raw.reduce((a, b) => a + b, 0);
  const scale = total / sumRaw;
  const stageDurations = raw.map((d) => d * scale);
  const stageBoundaries: number[] = [];
  let acc = 0;
  for (const d of stageDurations) {
    acc += d;
    stageBoundaries.push(acc);
  }
  return { total, stageDurations, stageBoundaries };
}

/**
 * Active stage index for elapsed seconds. Returns 6 (last stage) if past total.
 */
export function activeStageIndex(elapsed: number, schedule: LoaderSchedule): number {
  for (let i = 0; i < schedule.stageBoundaries.length; i++) {
    if (elapsed < schedule.stageBoundaries[i]) return i;
  }
  return schedule.stageBoundaries.length - 1;
}

/**
 * Progress ratio (0..1) considering the 95% cap while waiting on real data.
 * - dataArrived true: linear elapsed / total, max 1.
 * - dataArrived false: elapsed / total, but never above 0.95.
 */
export function progressForElapsed(
  elapsed: number,
  schedule: LoaderSchedule,
  dataArrived: boolean
): number {
  const raw = elapsed / schedule.total;
  if (dataArrived) return Math.min(1, raw);
  return Math.min(0.95, raw);
}

/**
 * Progress within current stage (0..1). Used to drive counters.
 */
export function stageProgress(
  elapsed: number,
  stageIndex: number,
  schedule: LoaderSchedule
): number {
  const stageStart =
    stageIndex === 0 ? 0 : schedule.stageBoundaries[stageIndex - 1];
  const stageEnd = schedule.stageBoundaries[stageIndex];
  const dur = stageEnd - stageStart;
  if (dur <= 0) return 1;
  return Math.max(0, Math.min(1, (elapsed - stageStart) / dur));
}

/**
 * Ease-out (cubic). Counter values feel natural with this.
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
