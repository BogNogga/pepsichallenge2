import { appendFile, mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { LogEntry, LogFilter, LogType } from "./logger-types";

const MAX_BUFFER_SIZE = 500;

// Use globalThis to share the buffer across Next.js module instances.
// Each API route is compiled as a separate bundle with its own module scope,
// so a plain module-level array would not be shared between routes.
const g = globalThis as unknown as { __devLogBuffer?: LogEntry[] };
if (!g.__devLogBuffer) g.__devLogBuffer = [];
const logBuffer = g.__devLogBuffer;

// Skip filesystem writes on serverless platforms with read-only filesystems
// (Vercel mounts /var/task read-only). The in-memory buffer + /api/dev/logs
// is already disabled in production, so file logs aren't useful there anyway.
const FILE_LOGGING_ENABLED = !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;

const logsDir = join(process.cwd(), "logs");
let logsDirCreated = false;

function ensureLogsDir() {
  if (!logsDirCreated) {
    mkdirSync(logsDir, { recursive: true });
    logsDirCreated = true;
  }
}

function getLogFilePath(): string {
  const date = new Date().toISOString().slice(0, 10);
  return join(logsDir, `${date}.jsonl`);
}

export function log(
  entry: Omit<LogEntry, "id" | "timestamp">
): void {
  const fullEntry: LogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Push to in-memory buffer
  logBuffer.push(fullEntry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Append to file (fire-and-forget) — skip on serverless read-only fs
  if (FILE_LOGGING_ENABLED) {
    try {
      ensureLogsDir();
      appendFile(getLogFilePath(), JSON.stringify(fullEntry) + "\n", (err) => {
        if (err) console.error("Failed to write log file:", err);
      });
    } catch (err) {
      console.error("Failed to write log file:", err);
    }
  }
}

export function getLogs(filter?: LogFilter): LogEntry[] {
  let results = [...logBuffer].reverse();

  if (filter?.type) {
    results = results.filter((e) => e.type === filter.type);
  }
  if (filter?.sessionId) {
    results = results.filter((e) => e.sessionId === filter.sessionId);
  }
  if (filter?.route) {
    results = results.filter((e) => e.route === filter.route);
  }
  if (filter?.search) {
    const term = filter.search.toLowerCase();
    results = results.filter((e) =>
      JSON.stringify(e.data).toLowerCase().includes(term)
    );
  }

  const limit = filter?.limit ?? 200;
  return results.slice(0, limit);
}

export function clearLogs(): void {
  logBuffer.length = 0;
}

export type { LogEntry, LogFilter, LogType };
