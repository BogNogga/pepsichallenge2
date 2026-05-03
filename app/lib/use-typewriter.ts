"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Typewriter hook. Returns the partial string typed in so far.
 * `cps` = characters per second.
 *
 * If `text` changes, the typewriter restarts on the new text.
 */
export function useTypewriter(text: string, cps = 10): string {
  const [out, setOut] = useState("");
  const cursor = useRef(0);
  const lastText = useRef(text);

  useEffect(() => {
    cursor.current = 0;
    lastText.current = text;
    setOut("");
    if (!text) return;
    const intervalMs = 1000 / Math.max(1, cps);

    const id = window.setInterval(() => {
      cursor.current += 1;
      setOut(text.slice(0, cursor.current));
      if (cursor.current >= text.length) {
        window.clearInterval(id);
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [text, cps]);

  return out;
}
