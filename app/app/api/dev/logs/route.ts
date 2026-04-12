import { NextResponse } from "next/server";
import { getLogs, clearLogs } from "@/lib/logger";
import type { LogType } from "@/lib/logger-types";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") as LogType | null;
  const sessionId = url.searchParams.get("sessionId") ?? undefined;
  const route = url.searchParams.get("route") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const limit = url.searchParams.get("limit")
    ? parseInt(url.searchParams.get("limit")!, 10)
    : undefined;

  const logs = getLogs({
    type: type ?? undefined,
    sessionId,
    route,
    search,
    limit,
  });

  return NextResponse.json({ logs, count: logs.length });
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  clearLogs();
  return NextResponse.json({ ok: true });
}
