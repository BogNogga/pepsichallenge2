"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Paperclip, Mic, Image as ImageIcon, Globe } from "lucide-react";

interface PromptInputProps {
  onSubmit: (query: string) => void;
  /** Optional: when provided, renders a small ghost link to run the demo with mock data. */
  onMockRun?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PromptInput({ onSubmit, onMockRun }: PromptInputProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    autoResize();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSubmit(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) onSubmit(query.trim());
    }
  };

  const canSubmit = query.trim().length > 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex min-h-[70vh] flex-col items-center justify-center px-4"
    >
      <motion.h1
        variants={item}
        className="text-5xl md:text-7xl font-bold text-text-primary text-center mb-4 tracking-tight max-w-4xl"
      >
        What are you shopping for?
      </motion.h1>

      <motion.p
        variants={item}
        className="text-text-secondary text-lg md:text-xl text-center mb-10 max-w-2xl"
      >
        Describe what you need. Our AI will help you find it.
      </motion.p>

      <motion.form
        variants={item}
        onSubmit={handleSubmit}
        className="w-full max-w-3xl"
      >
        <div className="bg-surface border border-border-subtle rounded-lg shadow-2xl focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="e.g. I'm looking for the best earbuds for working from home..."
            className="w-full resize-none bg-transparent px-6 pt-5 pb-2 text-text-primary placeholder:text-text-secondary/60 focus:outline-none text-lg leading-relaxed"
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              <ToolbarIcon Icon={Paperclip} label="Attach" />
              <ToolbarIcon Icon={ImageIcon} label="Add image" />
              <ToolbarIcon Icon={Globe} label="Web sources" />
              <ToolbarIcon Icon={Mic} label="Voice" />
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              aria-label="Find products"
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.form>

      {onMockRun && (
        <motion.button
          variants={item}
          type="button"
          onClick={onMockRun}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="mt-6 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface border border-border-subtle hover:border-text-secondary/50 rounded-lg px-3 py-1.5 transition-colors"
        >
          Run mock demo (no API calls)
        </motion.button>
      )}
    </motion.div>
  );
}

function ToolbarIcon({
  Icon,
  label,
}: {
  Icon: typeof Paperclip;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex items-center justify-center h-9 w-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
