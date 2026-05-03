"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { fallbackClarifyResponse, fallbackRecommendResponse } from "@/lib/fallbacks";
import { MOCK_QUERY } from "@/lib/mock-data";
import { mockClarify, mockRecommend } from "@/lib/mock-pipeline";
import type {
  ClarifyingQuestion,
  LiveProduct,
  QuestionAnswer,
  RecommendResponse,
  SearchPhase,
} from "@/lib/types";
import PromptInput from "@/components/PromptInput";
import ClarifyingQuestions from "@/components/ClarifyingQuestions";
import ProductGrid from "@/components/ProductGrid";
import LoaderScreen from "@/components/loader/LoaderScreen";
import TopBar from "@/components/chrome/TopBar";
import Footer from "@/components/chrome/Footer";
import CartIcon from "@/components/cart/CartIcon";
import CartModal from "@/components/cart/CartModal";
import FlyToCart from "@/components/cart/FlyToCart";
import AgentCheckoutTease from "@/components/AgentCheckoutTease";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: "easeIn" as const } },
};

export default function Home() {
  const [phase, setPhase] = useState<SearchPhase>("landing");
  const [query, setQuery] = useState("");
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [summary, setSummary] = useState("");
  const [dataArrived, setDataArrived] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [agentTeaseOpen, setAgentTeaseOpen] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const cartIconRef = useRef<HTMLButtonElement>(null);
  const mockModeRef = useRef(false);
  mockModeRef.current = mockMode;

  // Single-isRecommended: hero is the first isRecommended OR products[0]; rest is the rest.
  const { hero, rest } = useMemo(() => {
    if (products.length === 0) return { hero: null, rest: [] as LiveProduct[] };
    const heroIdx = products.findIndex((p) => p.isRecommended);
    const heroProduct = heroIdx >= 0 ? products[heroIdx] : products[0];
    const restProducts = products.filter((p) => p.id !== heroProduct.id);
    return { hero: heroProduct, rest: restProducts };
  }, [products]);

  // Stripe cancel returns with ?screen=results — drop us back into grid-ready with cart intact.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("screen") === "results") {
      // We can't restore products here (in-memory only). If there are no products
      // the user will see an empty state — but cart is preserved (CartProvider state).
      // Best-effort: drop them back at landing if no products are loaded.
      if (products.length > 0) {
        setPhase("grid-ready");
      }
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetToHome = useCallback(() => {
    setPhase("landing");
    setQuery("");
    setQuestions([]);
    setSessionId("");
    setProducts([]);
    setSummary("");
    setDataArrived(false);
    setShowHomeConfirm(false);
    setCartOpen(false);
    setMockMode(false);
  }, []);

  const handleHomeClick = useCallback(() => {
    if (phase === "landing") return;
    setShowHomeConfirm(true);
  }, [phase]);

  // Screen 1 → clarifying-loading
  const handlePromptSubmit = useCallback(async (userQuery: string) => {
    setQuery(userQuery);
    setPhase("clarifying-loading");

    if (mockModeRef.current) {
      const data = await mockClarify();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setPhase("clarifying-ready");
      return;
    }

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
      setPhase("clarifying-ready");
    } catch (error) {
      console.error("Clarify error:", error);
      toast.error("AI is temporarily unavailable. Using default questions.");
      setQuestions(fallbackClarifyResponse.questions);
      setPhase("clarifying-ready");
    }
  }, []);

  const handleMockRun = useCallback(() => {
    setMockMode(true);
    // mockModeRef will be true after the next render — set it now so the immediate
    // submission below picks the mock path.
    mockModeRef.current = true;
    handlePromptSubmit(MOCK_QUERY);
  }, [handlePromptSubmit]);

  // clarifying-ready → searching, hits /api/recommend SSE.
  // Frontend ignores backend `status` events — loader runs its own schedule.
  const handleClarifyingContinue = useCallback(
    async (answers: QuestionAnswer[]) => {
      setProducts([]);
      setSummary("");
      setDataArrived(false);
      setPhase("searching");

      if (mockModeRef.current) {
        const r = await mockRecommend();
        setProducts(r.recommendations);
        setSummary(r.summary);
        setDataArrived(true);
        return;
      }

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

          let dnl: number;
          while ((dnl = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, dnl);
            buffer = buffer.slice(dnl + 2);

            let eventType = "";
            const dataLines: string[] = [];
            for (const line of block.split("\n")) {
              if (line.startsWith("event: ")) eventType = line.slice(7).trim();
              else if (line.startsWith("data: ")) dataLines.push(line.slice(6));
              else if (dataLines.length > 0) dataLines[dataLines.length - 1] += line;
            }
            if (dataLines.length === 0) continue;
            const data = dataLines.join("\n");

            try {
              const parsed = JSON.parse(data);
              // Loader is pure theatre. We ignore `status` events.
              if (eventType === "result") {
                const r = parsed as RecommendResponse;
                setProducts(r.recommendations);
                setSummary(r.summary);
                setDataArrived(true);
                gotResult = true;
              } else if (eventType === "error") {
                throw new Error(parsed.message);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e;
            }
          }
        }
        if (!gotResult) throw new Error("No results received");
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
        setDataArrived(true);
      }
    },
    [query, sessionId]
  );

  // Loader → reveal: triggered when LoaderScreen reports schedule complete AND data arrived.
  const handleScheduleComplete = useCallback(() => {
    setPhase("revealing");
  }, []);

  const handleSeeAllOptions = useCallback(() => {
    setPhase("grid-ready");
  }, []);

  const handleAgentCheckout = useCallback(() => {
    setAgentTeaseOpen(true);
  }, []);

  // The Sign Up / cart-icon swap: cart icon only on grid-ready
  const topBarRightSlot =
    phase === "grid-ready" ? (
      <CartIcon ref={cartIconRef} onClick={() => setCartOpen(true)} />
    ) : undefined;

  return (
    <main className="min-h-screen relative pt-20 pb-16">
      <TopBar
        rightSlot={topBarRightSlot}
        mockMode={mockMode}
        onHome={phase !== "landing" ? handleHomeClick : undefined}
      />

      {/* Home confirmation modal */}
      <AnimatePresence>
        {showHomeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHomeConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border-subtle rounded-lg p-6 max-w-sm mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">Are you sure?</h3>
              <p className="text-text-secondary text-sm mb-6">
                You&apos;ll lose your current search.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowHomeConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-text-secondary/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={resetToHome}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-accent hover:bg-accent/90 text-white transition-colors"
                >
                  Back to home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase-driven screen content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {phase === "landing" && (
            <motion.div key="landing" {...pageTransition}>
              <PromptInput onSubmit={handlePromptSubmit} onMockRun={handleMockRun} />
            </motion.div>
          )}

          {(phase === "clarifying-loading" || phase === "clarifying-ready") && (
            <motion.div key="clarifying" {...pageTransition}>
              <ClarifyingQuestions
                questions={questions}
                originalQuery={query}
                onContinue={handleClarifyingContinue}
                isLoading={phase === "clarifying-loading"}
              />
            </motion.div>
          )}

          {(phase === "searching" || phase === "revealing") && (
            <motion.div key="loader" {...pageTransition}>
              <LoaderScreen
                phase={phase}
                dataArrived={dataArrived}
                product={hero}
                onScheduleComplete={handleScheduleComplete}
                onSeeAllOptions={handleSeeAllOptions}
                onAgentCheckout={handleAgentCheckout}
              />
            </motion.div>
          )}

          {phase === "grid-ready" && hero && (
            <motion.div key="grid" {...pageTransition}>
              <ProductGrid
                hero={hero}
                rest={rest}
                summary={summary}
                onFindOthers={() => {
                  // No-op show element. Click pulse already on the button itself.
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {/* Cart modal lives at root so its scale-from-icon animation is unaffected by screen transitions. */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        anchorRef={cartIconRef}
      />

      {/* Fly-to-cart helper — listens globally for flytocart events. */}
      <FlyToCart cartIconRef={cartIconRef} />

      {/* Agent checkout tease */}
      <AgentCheckoutTease open={agentTeaseOpen} onClose={() => setAgentTeaseOpen(false)} />
    </main>
  );
}
