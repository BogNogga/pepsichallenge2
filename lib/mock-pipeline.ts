import {
  buildMockProducts,
  MOCK_SUMMARY,
  mockClarifyResponse,
} from "./mock-data";
import type { ClarifyResponse, RecommendResponse } from "./types";

/**
 * Mock pipeline — runs the demo end-to-end without calling Claude or hitting the
 * web search tool. Timings approximate a real run so the loader theatre still has
 * something to wait on:
 *
 * - mockClarify: 1.8–2.4s (LLM-style "generating questions" feel)
 * - mockRecommend: 26–34s by default (loader's own ~55–60s schedule still completes
 *   with `dataArrived` already set, so the cap behaviour is exercised gently).
 *
 * Override via opts to exercise edge cases:
 * - `delayMs: 200` — instant data arrival, exercises the "data arrived early" path.
 * - `delayMs: 65000` — exercises the 95% hold path.
 */

export type MockOpts = {
  delayMs?: number;
};

export type MockClarifyOpts = MockOpts;
export type MockRecommendOpts = MockOpts;

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}

export async function mockClarify(opts: MockClarifyOpts = {}): Promise<{
  sessionId: string;
  questions: ClarifyResponse["questions"];
}> {
  const ms = opts.delayMs ?? jitter(2100, 600);
  await sleep(ms);
  return {
    sessionId: `mock-${Date.now().toString(36)}`,
    questions: mockClarifyResponse.questions,
  };
}

export async function mockRecommend(
  opts: MockRecommendOpts = {}
): Promise<RecommendResponse> {
  const ms = opts.delayMs ?? jitter(30000, 8000);
  await sleep(ms);
  return {
    summary: MOCK_SUMMARY,
    recommendations: buildMockProducts(),
  };
}
