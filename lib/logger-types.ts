export type LogType = "search_query" | "ai_input" | "ai_output";

export type LogEntry = {
  id: string;
  timestamp: string;
  type: LogType;
  sessionId: string;
  route: string;
  durationMs?: number;
  data: unknown;
  error?: string;
};

export type LogFilter = {
  type?: LogType;
  sessionId?: string;
  route?: string;
  search?: string;
  limit?: number;
};
