"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { fallbackClarifyResponse, fallbackRecommendResponse } from "@/lib/fallbacks";
import type {
  AppScreen,
  ClarifyingQuestion,
  LiveProduct,
  QuestionAnswer,
  RecommendResponse,
} from "@/lib/types";
import PromptInput from "@/components/PromptInput";
import ClarifyingQuestions from "@/components/ClarifyingQuestions";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";

const pageTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: "easeIn" as const } },
};

export default function Home() {
  // Screen state
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [query, setQuery] = useState("");

  // Clarify state
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarifyLoading, setClarifyLoading] = useState(false);

  // Session tracking for logging
  const [sessionId, setSessionId] = useState("");

  // Recommend state
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [summary, setSummary] = useState("");
  const [streamedSummary, setStreamedSummary] = useState("");
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Cart drawer
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  // Handle URL param for returning from Stripe cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("screen") === "results") {
      setScreen("results");
      // Clean up URL without reload
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Screen 1 → Screen 2: Submit query
  const handlePromptSubmit = useCallback(async (userQuery: string) => {
    setQuery(userQuery);
    setScreen("clarifying");
    setClarifyLoading(true);

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!res.ok) throw new Error("Clarify API failed");

      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setQuestions(data.questions);
    } catch (error) {
      console.error("Clarify error:", error);
      toast.error("AI is temporarily unavailable. Using default questions.");
      setQuestions(fallbackClarifyResponse.questions);
    } finally {
      setClarifyLoading(false);
    }
  }, []);

  // Screen 2 → Screen 3: Submit answers, fetch recommendations via SSE
  const handleClarifyingContinue = useCallback(
    async (answers: QuestionAnswer[]) => {
      setScreen("results");
      setRecommendLoading(true);
      setProducts([]);
      setSummary("");
      setStreamedSummary("");
      setStatusMessage("Searching the web...");

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, answers, sessionId }),
        });

        if (!res.ok) throw new Error("Recommend API failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let buffer = "";
        let gotResult = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events (terminated by double newline)
          let doubleNewline: number;
          while ((doubleNewline = buffer.indexOf("\n\n")) !== -1) {
            const eventBlock = buffer.slice(0, doubleNewline);
            buffer = buffer.slice(doubleNewline + 2);

            let eventType = "";
            let dataLines: string[] = [];

            for (const line of eventBlock.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                dataLines.push(line.slice(6));
              } else if (dataLines.length > 0) {
                // Continuation of a data line split across chunks
                dataLines[dataLines.length - 1] += line;
              }
            }

            if (dataLines.length === 0) continue;
            const data = dataLines.join("\n");

            try {
              const parsed = JSON.parse(data);

              if (eventType === "status") {
                setStatusMessage(parsed.message);
              } else if (eventType === "result") {
                const result = parsed as RecommendResponse;
                setProducts(result.recommendations);
                setSummary(result.summary);
                setStreamedSummary(result.summary);
                setRecommendLoading(false);
                gotResult = true;
              } else if (eventType === "error") {
                throw new Error(parsed.message);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e;
            }
          }
        }

        // If we never got a result event, something went wrong
        if (!gotResult) {
          throw new Error("No results received");
        }
      } catch (error) {
        console.error("Recommend error:", error);
        toast.error("AI is temporarily unavailable. Showing sample products.", {
          action: {
            label: "Retry",
            onClick: () => handleClarifyingContinue(answers),
          },
        });
        setProducts(fallbackRecommendResponse.recommendations);
        setSummary(fallbackRecommendResponse.summary);
        setStreamedSummary(fallbackRecommendResponse.summary);
        setRecommendLoading(false);
      }
    },
    [query, sessionId]
  );

  return (
    <main className="min-h-screen relative">
      {/* Cart icon - fixed top right, visible on screens 3+ */}
      {(screen === "results") && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setCartOpen(true)}
          className="fixed top-6 right-6 z-30 bg-surface border border-border-subtle rounded-xl p-3 hover:border-accent transition-colors shadow-lg"
        >
          <ShoppingCart className="h-5 w-5 text-text-primary" />
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </motion.button>
      )}

      {/* Screen transitions */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {screen === "landing" && (
            <motion.div key="landing" {...pageTransition}>
              <PromptInput onSubmit={handlePromptSubmit} />
            </motion.div>
          )}

          {screen === "clarifying" && (
            <motion.div key="clarifying" {...pageTransition}>
              <ClarifyingQuestions
                questions={questions}
                originalQuery={query}
                onContinue={handleClarifyingContinue}
                isLoading={clarifyLoading}
              />
            </motion.div>
          )}

          {screen === "results" && (
            <motion.div key="results" {...pageTransition}>
              <ProductGrid
                products={products}
                summary={summary}
                isLoading={recommendLoading}
                streamedSummary={recommendLoading ? statusMessage : streamedSummary}
                onCheckout={() => setCartOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
