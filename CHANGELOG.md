# Changelog

## 2026-04-12

### Added
- **Dev logging system** — structured logs for all search queries, AI inputs/outputs. File-based (`logs/*.jsonl`) + in-memory buffer for dev panel.
- **Dev panel UI** (`/dev`) — real-time log viewer with auto-refresh, type/route/search filters, expandable JSON payloads.
- **Dev logs API** (`/api/dev/logs`) — GET with filters, DELETE to clear. Production-guarded.
- **Session linking** — clarify and recommend share a `sessionId` for end-to-end request tracing.
- **CLAUDE.md** — codebase documentation for AI-assisted development.

### Fixed
- **Search results never showing** — stale React closure in `page.tsx` always overwrote real products with fallback data. Replaced state check with local `gotResult` flag.
- **SSE parser failing on large payloads** — old parser couldn't reassemble JSON split across TCP chunks. Rewrote to buffer until double-newline boundary before parsing.
- **Recommend stream crash** — `controller.enqueue()` on already-closed stream threw `ERR_INVALID_STATE`. Added `safeEnqueue`/`safeClose` guards.
- **Claude API timeout** — bumped from 60s to 120s. Web search calls average ~50s, leaving no headroom before.

### Changed
- Logger uses `globalThis` for cross-route buffer sharing (Next.js compiles each route as a separate module).
