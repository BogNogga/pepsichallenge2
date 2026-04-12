"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface PromptInputProps {
  onSubmit: (query: string) => void;
}

const suggestions = [
  "Best for work calls",
  "Noise cancelling under $200",
  "Long battery life",
  "Premium sound quality",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PromptInput({ onSubmit }: PromptInputProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    autoResize();
  };

  const handleChip = (text: string) => {
    setQuery(text);
    // Need to wait a tick for state to update before resizing
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    });
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4"
    >
      <motion.h1
        variants={item}
        className="text-4xl md:text-5xl font-bold text-text-primary text-center mb-4"
      >
        What are you shopping for?
      </motion.h1>

      <motion.p
        variants={item}
        className="text-text-secondary text-lg text-center mb-10 max-w-xl"
      >
        Describe what you need. Our AI will help you find it.
      </motion.p>

      <motion.form
        variants={item}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-4"
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="e.g. I'm looking for the best earbuds for working from home..."
            className="w-full resize-none bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors text-base leading-relaxed"
          />
        </div>

        <Button
          type="submit"
          disabled={!query.trim()}
          className="self-end bg-accent hover:bg-accent/90 text-white rounded-xl px-8 h-12 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Search className="mr-2 h-4 w-4" />
          Find products
        </Button>
      </motion.form>

      <motion.div variants={item} className="flex flex-wrap gap-3 mt-8 justify-center max-w-2xl">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => handleChip(text)}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-background text-text-secondary text-sm hover:border-accent hover:text-accent transition-colors cursor-pointer"
          >
            {text}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
