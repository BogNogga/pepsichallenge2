"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LogEntry, LogType } from "@/lib/logger-types";

const TYPE_COLORS: Record<LogType, string> = {
  search_query: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai_input: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ai_output: "bg-green-500/20 text-green-400 border-green-500/30",
};

const TYPE_LABELS: Record<LogType, string> = {
  search_query: "Search",
  ai_input: "AI Input",
  ai_output: "AI Output",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

export default function DevPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [count, setCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [typeFilter, setTypeFilter] = useState<LogType | "">("");
  const [routeFilter, setRouteFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (routeFilter) params.set("route", routeFilter);
    if (searchText) params.set("search", searchText);

    try {
      const res = await fetch(`/api/dev/logs?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs);
      setCount(data.count);
    } catch {
      // silently fail
    }
  }, [typeFilter, routeFilter, searchText]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLogs]);

  const handleClear = async () => {
    await fetch("/api/dev/logs", { method: "DELETE" });
    setLogs([]);
    setCount(0);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dev Logs</h1>
            <p className="text-sm text-[#A1A1AA]">{count} entries</p>
          </div>
          <a
            href="/"
            className="text-sm text-[#06B6D4] hover:underline"
          >
            Back to app
          </a>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[#141414] border border-[#262626] rounded-xl">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as LogType | "")}
            className="bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06B6D4]"
          >
            <option value="">All types</option>
            <option value="search_query">Search Query</option>
            <option value="ai_input">AI Input</option>
            <option value="ai_output">AI Output</option>
          </select>

          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#06B6D4]"
          >
            <option value="">All routes</option>
            <option value="clarify">clarify</option>
            <option value="recommend">recommend</option>
          </select>

          <input
            type="text"
            placeholder="Search logs..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:border-[#06B6D4]"
          />

          <label className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-[#06B6D4]"
            />
            Auto-refresh
          </label>

          <button
            onClick={fetchLogs}
            className="px-3 py-2 text-sm bg-[#262626] hover:bg-[#333] rounded-lg transition-colors"
          >
            Refresh
          </button>

          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Log entries */}
        <div className="space-y-2">
          {logs.length === 0 && (
            <div className="text-center py-12 text-[#A1A1AA]">
              No logs yet. Make a search to generate some.
            </div>
          )}

          {logs.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(entry.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1a] transition-colors"
              >
                {/* Timestamp */}
                <span className="text-xs text-[#A1A1AA] font-mono shrink-0">
                  {formatTime(entry.timestamp)}
                </span>

                {/* Type badge */}
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0 ${TYPE_COLORS[entry.type]}`}
                >
                  {TYPE_LABELS[entry.type]}
                </span>

                {/* Route badge */}
                <span className="inline-flex items-center rounded-full border border-[#262626] bg-[#262626]/50 px-2 py-0.5 text-xs text-[#A1A1AA] shrink-0">
                  {entry.route}
                </span>

                {/* Session ID */}
                <span className="text-xs text-[#A1A1AA] font-mono shrink-0">
                  {entry.sessionId.slice(0, 8)}
                </span>

                {/* Duration */}
                {entry.durationMs !== undefined && (
                  <span className="text-xs text-[#06B6D4] shrink-0">
                    {entry.durationMs}ms
                  </span>
                )}

                {/* Error indicator */}
                {entry.error && (
                  <span className="text-xs text-red-400 shrink-0">
                    Error
                  </span>
                )}

                {/* Expand indicator */}
                <span className="ml-auto text-[#A1A1AA] text-xs shrink-0">
                  {expandedIds.has(entry.id) ? "collapse" : "expand"}
                </span>
              </button>

              {expandedIds.has(entry.id) && (
                <div className="px-4 pb-4 border-t border-[#262626]">
                  {entry.error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                      {entry.error}
                    </div>
                  )}
                  <pre className="mt-3 p-3 bg-[#0A0A0A] rounded-lg text-xs font-mono text-[#A1A1AA] overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
