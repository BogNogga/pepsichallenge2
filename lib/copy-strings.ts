/**
 * Loader & clarifying copy strings — locked in vault notes.
 * Pepsi UI — technical specs.md and Pepsi UI — current state description.md.
 * App language is English.
 */

import { easeOutCubic } from "./loader-math";

/** 12 rotating strings shown above the question skeletons while /api/clarify runs. */
export const CLARIFYING_LOADING_STRINGS: string[] = [
  "Reading your request",
  "Understanding your priorities",
  "Mapping the trade-offs",
  "Identifying what matters here",
  "Sharpening the brief",
  "Drafting the right questions",
  "Calibrating to your need",
  "Cutting the fluff",
  "Picking what to clarify",
  "Looking for hidden constraints",
  "Finalizing the question set",
  "Almost ready",
];

export type LoaderStage = {
  /** Bullet label shown next to the marker. */
  label: string;
  /** 5 candidate status strings — picked one per run. */
  statusStrings: string[];
  /**
   * Counter renderer. `t` is stage progress 0..1.
   * Already eased — just plug into the format string.
   */
  counter: (t: number) => string;
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export const LOADER_STAGES: LoaderStage[] = [
  // 1
  {
    label: "Understanding your needs",
    statusStrings: [
      "Parsing your requirements",
      "Mapping priorities to features",
      "Separating must-haves from nice-to-haves",
      "Building your need profile",
      "Translating preferences into search criteria",
    ],
    counter: (t) => `Parsing ${fmt(easeOutCubic(t) * 8)} of 8 signals`,
  },
  // 2
  {
    label: "Searching across retailers",
    statusStrings: [
      "Querying major audio retailers",
      "Reaching across e-commerce platforms",
      "Pulling product catalogs",
      "Scanning marketplaces and brand stores",
      "Casting a wide net",
    ],
    counter: (t) => {
      const e = easeOutCubic(t);
      return `${fmt(e * 24)} retailers · ${fmt(e * 340)} products found`;
    },
  },
  // 3
  {
    label: "Filtering by your criteria",
    statusStrings: [
      "Removing products that don't match",
      "Filtering by your budget range",
      "Cutting candidates that fail your specs",
      "Narrowing to relevant options",
      "Trimming the list",
    ],
    counter: (t) => `Reviewed ${fmt(easeOutCubic(t) * 340)} of 340 candidates`,
  },
  // 4
  {
    label: "Reading customer reviews",
    statusStrings: [
      "Reading professional reviews",
      "Pulling user sentiment from forums",
      "Aggregating customer feedback",
      "Checking real-world experiences",
      "Scanning long-term ownership reports",
    ],
    counter: (t) => {
      const e = easeOutCubic(t);
      return `${fmt(e * 1247)} reviews from ${fmt(e * 18)} sources`;
    },
  },
  // 5
  {
    label: "Comparing specifications",
    statusStrings: [
      "Cross-checking battery claims",
      "Verifying Bluetooth versions",
      "Comparing noise-cancelling performance",
      "Lining up feature tables",
      "Spotting spec differences",
    ],
    counter: (t) => {
      const e = easeOutCubic(t);
      return `${fmt(e * 28)} specs across ${fmt(e * 12)} products`;
    },
  },
  // 6
  {
    label: "Cross-checking prices",
    statusStrings: [
      "Checking current prices",
      "Looking for active deals",
      "Comparing across retailers",
      "Verifying availability",
      "Watching for stock issues",
    ],
    counter: (t) => `Checked ${fmt(easeOutCubic(t) * 12)} of 12 retailers`,
  },
  // 7
  {
    label: "Ranking recommendations",
    statusStrings: [
      "Weighting against your priorities",
      "Scoring candidates",
      "Picking the standouts",
      "Finalizing the top selection",
      "Building your rationale",
    ],
    counter: (t) => `Ranked ${fmt(easeOutCubic(t) * 12)} of 12 candidates`,
  },
];

/**
 * Pick one status string per stage at the start of a run.
 */
export function pickStageStrings(): string[] {
  return LOADER_STAGES.map(
    (s) => s.statusStrings[Math.floor(Math.random() * s.statusStrings.length)]
  );
}

export function pickClarifyingString(prev?: string): string {
  if (CLARIFYING_LOADING_STRINGS.length === 0) return "";
  if (!prev) {
    return CLARIFYING_LOADING_STRINGS[
      Math.floor(Math.random() * CLARIFYING_LOADING_STRINGS.length)
    ];
  }
  // Pick one different from prev
  let next = prev;
  let safety = 8;
  while (next === prev && safety-- > 0) {
    next =
      CLARIFYING_LOADING_STRINGS[
        Math.floor(Math.random() * CLARIFYING_LOADING_STRINGS.length)
      ];
  }
  return next;
}
